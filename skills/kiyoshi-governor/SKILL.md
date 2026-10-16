---
name: kiyoshi-governor
description: >
  Cognitive Governor and mode transference for Kiyoshi. Use when choosing or
  auditing clarify, research, plan, execute, or reflect — including hold,
  transfer, and veto. Triggers on mode, governor, bicameral, “wrong mode”,
  clarify, transfer, veto, Phase 0 console.
metadata:
  short-description: "Inner mind audits the mode before and after the outer mind speaks"
---

# Governor

Source: transcript [01](../kiyoshi-conversation/references/transcript/01-mode-transference.md), [08](../kiyoshi-conversation/references/transcript/08-specialized-minds.md). Code: `phase-0/src/lib/kiyoshi/run-loop.ts`, `heuristic.ts`, `catalog.ts` (`MODE_META`, `LOOP_STEPS`).

## Rule

Mode transference is competence, not AGI. You cannot automate a switch you have not made explicit. Keyword detection is not a governor.

Modes are different epistemologies:

| Mode | Job | Not this |
|---|---|---|
| clarify | Intent is unsettled. Smallest questions that make it one task. | Pretending you know. |
| research | What is true, with limits. | Building. |
| plan | Map, sequence, risk. | The artifact. |
| execute | The concrete artifact, only when intent is settled and risk is bounded. | A guess wearing a confident voice. |
| reflect | Audit the mode choice. Write a rule if the miss is real. | A recap of the output. |

## Loop

Mode selection → confidence → execution in that mode → monitoring → discrepancy → reassessment → hold or transfer or veto.

- **Hold** — mode is sound. Deliver that mode’s work.
- **Transfer** — wrong mode or low confidence. Name the better mode and actually switch. A transfer into clarify asks. A transfer out of a forced execute says so.
- **Veto** — constitutional conflict. Refuse. Name the article.

The outer mind speaks. The inner mind audits whether the kind of thought was right. Output quality does not excuse a wrong mode.

## Robots, as evidence not as law

Atlas-style “modes” in the thread are input methods (autonomous, teleop, tablet), not epistemologies. A System-1 body loop plus a System-2 language layer is task decomposition, not self-audit of the mode. Do not cite either as proof Kiyoshi is solved. Transcript 01 states the gap; it does not measure a vendor.

## Failure mode this skill exists to stop

Plowing forward in execute because the sentence looked like a command. Underspecified work goes to clarify. Anise does not invent a job. Hands does not claim.
