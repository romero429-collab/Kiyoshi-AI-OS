import { create } from "zustand";
import {
  DT_CHECK,
  HERALD_F,
  P_READ,
  T1,
  T1_EFF,
  decayRate,
  predictBelief,
  stepOccupation,
  updateBelief,
  type Mode,
} from "@/lib/phonon/physics";

export type Bit = { q: 0 | 1; match: boolean; t: number };
export type Point = { t: number; n: 0 | 1; p: number };
export type Jump = { tUs: number; mode: Mode };

const MAX_POINTS = 700;
const MAX_BITS = 36;

type PhononState = {
  mode: Mode;
  running: boolean;
  repeat: boolean;
  dilation: number;
  armed: boolean;
  n: 0 | 1;
  t: number;
  p: number;
  streak: number;
  checks: number;
  bits: Bit[];
  points: Point[];
  jumps: Jump[];
  heraldOk: number;
  heraldMiss: number;
  acc: number;
  hold: number;
  setMode: (mode: Mode) => void;
  setDilation: (dilation: number) => void;
  toggleRun: () => void;
  toggleRepeat: () => void;
  arm: () => void;
  clearJumps: () => void;
  sampleEnsemble: (count: number) => void;
  advance: (dtWall: number) => void;
};

function freshArm(prev: { heraldOk: number; heraldMiss: number }) {
  const n: 0 | 1 = Math.random() < HERALD_F ? 1 : 0;
  return {
    armed: true,
    running: true,
    n,
    t: 0,
    p: HERALD_F,
    streak: 0,
    checks: 0,
    bits: [] as Bit[],
    points: [{ t: 0, n, p: HERALD_F }] as Point[],
    acc: 0,
    hold: n === 0 ? 200e-6 : -1,
    heraldOk: prev.heraldOk + (n === 1 ? 1 : 0),
    heraldMiss: prev.heraldMiss + (n === 0 ? 1 : 0),
  };
}

export const usePhonon = create<PhononState>((set, get) => ({
  mode: "watched",
  running: false,
  repeat: true,
  dilation: 6000,
  armed: false,
  n: 0,
  t: 0,
  p: 0,
  streak: 0,
  checks: 0,
  bits: [],
  points: [],
  jumps: [],
  heraldOk: 0,
  heraldMiss: 0,
  acc: 0,
  hold: -1,

  setMode: (mode) => set({ mode }),
  setDilation: (dilation) => set({ dilation }),
  toggleRun: () => {
    const s = get();
    if (!s.armed) {
      set(freshArm(s));
      return;
    }
    set({ running: !s.running });
  },
  toggleRepeat: () => set({ repeat: !get().repeat }),
  arm: () => set(freshArm(get())),
  clearJumps: () => set({ jumps: [], heraldOk: 0, heraldMiss: 0 }),

  sampleEnsemble: (count) => {
    const mode = get().mode;
    const tauUs = (mode === "watched" ? T1_EFF : T1) * 1e6;
    const jumps: Jump[] = new Array(count);
    for (let i = 0; i < count; i++) {
      const u = Math.max(1e-12, Math.random());
      jumps[i] = { tUs: -tauUs * Math.log(u), mode };
    }
    set({ jumps });
  },

  advance: (dtWall) => {
    const s = get();
    if (!s.running || !s.armed) return;
    const { gDown, gUp, tau } = decayRate(s.mode);
    let acc = s.acc + Math.min(dtWall, 0.05) / s.dilation;
    let n = s.n;
    let t = s.t;
    let p = s.p;
    let streak = s.streak;
    let checks = s.checks;
    let hold = s.hold;
    let bits = s.bits;
    let points = s.points;
    let jumps = s.jumps;
    let jumped = false;
    let guard = 0;

    while (acc >= DT_CHECK && guard++ < 48) {
      acc -= DT_CHECK;
      const prev = n;
      const holding = hold >= 0;
      if (holding) {
        n = 0;
      } else {
        n = stepOccupation(n, gDown, gUp, DT_CHECK, Math.random());
      }
      t += DT_CHECK;
      p = predictBelief(p, gDown, gUp, DT_CHECK);

      if (s.mode === "watched") {
        const truth: 0 | 1 = n;
        const q: 0 | 1 = Math.random() < P_READ ? truth : truth === 1 ? 0 : 1;
        p = updateBelief(p, q);
        const bit = { q, match: q === truth, t };
        bits = bits.length >= MAX_BITS ? [...bits.slice(1), bit] : [...bits, bit];
        checks += 1;
        const prevQ = bits.length > 1 ? bits[bits.length - 2].q : q;
        streak = bits.length > 1 && prevQ === q ? streak + 1 : 1;
      }

      if (!holding && prev === 1 && n === 0) {
        jumped = true;
        const rec = { tUs: t * 1e6, mode: s.mode };
        jumps = jumps.length >= 4000 ? [...jumps.slice(-3999), rec] : [...jumps, rec];
        hold = Math.min(0.35 * tau, 400e-6);
      }

      const point = { t, n, p };
      points = points.length >= MAX_POINTS ? [...points.slice(1), point] : [...points, point];

      if (n === 0 && hold >= 0) {
        hold -= DT_CHECK;
        if (hold <= 0) {
          if (s.repeat) {
            set({
              ...freshArm(get()),
              jumps,
              mode: s.mode,
              dilation: s.dilation,
              repeat: s.repeat,
            });
            return;
          }
          set({
            n,
            t,
            p,
            streak,
            checks,
            bits,
            points,
            jumps,
            acc: 0,
            hold: -1,
            running: false,
          });
          return;
        }
      }
    }

    if (jumped || guard > 0) {
      set({ n, t, p, streak, checks, bits, points, jumps, acc, hold });
    } else {
      set({ acc });
    }
  },
}));
