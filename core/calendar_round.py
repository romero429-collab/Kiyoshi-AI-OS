"""
Calendar Round Persistence Engine

Persists the Omega-limit attractor seed (c), transmission ratios, and
GreekMeshCouncil final state so the next cycle can resume from a
deterministically recoverable point.
"""

from __future__ import annotations
from dataclasses import dataclass, asdict
from typing import Optional, Dict, Any
from datetime import datetime
import json
import hashlib
from pathlib import Path

@dataclass
class CalendarRoundRecord:
    cycle_id: str
    timestamp: str
    omega_seed: float
    final_scalar: float
    constitutional: bool
    quaternion_norm: float
    octonion_norm: float
    transmission_ratios_hash: str
    notes: str = ""
    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)

class CalendarRoundPersistence:
    def __init__(self, store_path: Optional[Path] = None):
        self.store_path = store_path or Path("/workspace/artifacts/kiyoshi/calendar_round.json")
        self.store_path.parent.mkdir(parents=True, exist_ok=True)
        self._records = []
        self._load()
    def _load(self):
        if self.store_path.exists():
            try:
                raw = json.loads(self.store_path.read_text())
                self._records = [CalendarRoundRecord(**r) for r in raw]
            except Exception:
                self._records = []
    def _save(self):
        self.store_path.write_text(json.dumps([r.to_dict() for r in self._records], indent=2))
    def commit_cycle(self, omega_seed, final_scalar, constitutional, quaternion_norm=1.0, octonion_norm=1.0, notes=""):
        cycle_id = hashlib.sha256(f"{datetime.utcnow().isoformat()}{omega_seed}{final_scalar}".encode()).hexdigest()[:16]
        ratios_hash = hashlib.sha256(b"1.00,0.83,0.81,0.79,0.75,0.72").hexdigest()[:12]
        rec = CalendarRoundRecord(cycle_id, datetime.utcnow().isoformat(), omega_seed, final_scalar, constitutional, quaternion_norm, octonion_norm, ratios_hash, notes)
        self._records.append(rec)
        self._save()
        return rec
    def latest(self):
        return self._records[-1] if self._records else None
    def all_records(self):
        return list(self._records)
