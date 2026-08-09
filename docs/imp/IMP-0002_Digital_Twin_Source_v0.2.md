---
schema_version: "0.2"

artifact:
  id: "IMP-0002-SRC"
  type: "Implementation Source Code"
  title: "Protective Membrane Digital Twin Source (Phases 1-3)"
  version: "0.2"

depends_on:
  - "IMP-0002"

provenance:
  authority:
    - "Constitution-v0.1-R Article IV"
  foundation:
    - "IMP-0002"
  structure: []
  rationale: []
  realization: []
  evidence: []

review:
  status: "Accepted"
  reviewers:
    - "Gabriel"
    - "ChatGPT"
    - "Gemini"
    - "Grok"
  last_reviewed: "2026-07-29"

ledger:
  id: "LEDGER-0018"
  state: "Accepted"
---

# IMP-0002: Digital Twin Source Code (Phases 1, 2, and 3)

This artifact contains the executable Python modules for the **Authority Kernel**, **Evidence Ledger**, and **Decision Context**.

## 1. `protective_membrane/core/enums.py`

```python
from enum import Enum, IntEnum

class CapabilityDimension(Enum):
    OBSERVATION = "observation"
    RESTRICTION = "restriction"
    TRANSFORMATION = "transformation"
    DECOUPLING = "decoupling"
    ISOLATION = "isolation"
    PHYSICAL_CONTROL = "physical_control"

class AuthorityLevel(IntEnum):
    NONE = 0
    CLAIMED = 1
    VERIFIED = 2
    DEMONSTRATED = 3

class VerificationMethod(Enum):
    API_PROBE = "api_probe"
    SIGNATURE_VERIFICATION = "signature_verification"
    HARDWARE_ATTESTATION = "hardware_attestation"
    SANDBOX_PROBE = "sandbox_probe"
    SIMULATED_PROFILE = "simulated_profile"

class DriftSeverity(IntEnum):
    NONE = 0
    LOW = 1
    MEDIUM = 2
    HIGH = 3
    CRITICAL = 4

class Classification(Enum):
    SAFE = "safe"
    RESTRICTED = "restricted"
    UNSAFE = "unsafe"
    UNKNOWN = "unknown"

class PolicyAction(Enum):
    PREVENT = "prevent"
    CONTAIN = "contain"
    TRANSFORM = "transform"
    DECOUPLE = "decouple"
    ISOLATE = "isolate"
    ESCALATE = "escalate"
```

## 2. `protective_membrane/authority/vector.py`

```python
from dataclasses import dataclass
from protective_membrane.core.enums import CapabilityDimension, AuthorityLevel

@dataclass(frozen=True)
class AuthorityVector:
    observation: AuthorityLevel = AuthorityLevel.NONE
    restriction: AuthorityLevel = AuthorityLevel.NONE
    transformation: AuthorityLevel = AuthorityLevel.NONE
    decoupling: AuthorityLevel = AuthorityLevel.NONE
    isolation: AuthorityLevel = AuthorityLevel.NONE
    physical_control: AuthorityLevel = AuthorityLevel.NONE
    verification_confidence: float = 0.0

    def get_level(self, dimension: CapabilityDimension) -> AuthorityLevel:
        return getattr(self, dimension.value, AuthorityLevel.NONE)

    def can_execute(self, dimension: CapabilityDimension, required_level: AuthorityLevel = AuthorityLevel.VERIFIED) -> bool:
        return self.get_level(dimension) >= required_level
```

## 3. `protective_membrane/authority/evidence.py`

```python
from dataclasses import dataclass, field
from datetime import datetime
from protective_membrane.core.enums import CapabilityDimension, AuthorityLevel, VerificationMethod

@dataclass(frozen=True)
class CapabilityEvidence:
    substrate_id: str
    dimension: CapabilityDimension
    claimed_level: AuthorityLevel
    observed_level: AuthorityLevel
    verification_method: VerificationMethod
    confidence: float
    timestamp: str = field(default_factory=lambda: datetime.utcnow().isoformat() + "Z")
```

## 4. `protective_membrane/authority/verifier.py`

```python
from typing import List, Protocol
from protective_membrane.core.enums import CapabilityDimension, AuthorityLevel
from protective_membrane.authority.vector import AuthorityVector
from protective_membrane.authority.evidence import CapabilityEvidence

class ConfidenceAggregator(Protocol):
    def aggregate(self, evidence_log: List[CapabilityEvidence]) -> float:
        ...

class MinimumConfidenceAggregator:
    def aggregate(self, evidence_log: List[CapabilityEvidence]) -> float:
        if not evidence_log:
            return 0.0
        return min(ev.confidence for ev in evidence_log)

class AuthorityVerifier:
    def __init__(self, aggregator: ConfidenceAggregator = MinimumConfidenceAggregator()):
        self.aggregator = aggregator

    def verify(self, claimed: AuthorityVector, evidence_log: List[CapabilityEvidence]) -> AuthorityVector:
        if not evidence_log:
            return AuthorityVector()

        resolved_levels = {}
        for ev in evidence_log:
            if ev.claimed_level > AuthorityLevel.NONE and ev.observed_level >= AuthorityLevel.VERIFIED:
                resolved = ev.observed_level
            else:
                resolved = AuthorityLevel.NONE
            resolved_levels[ev.dimension.value] = resolved

        final_confidence = self.aggregator.aggregate(evidence_log)

        return AuthorityVector(
            observation=resolved_levels.get(CapabilityDimension.OBSERVATION.value, AuthorityLevel.NONE),
            restriction=resolved_levels.get(CapabilityDimension.RESTRICTION.value, AuthorityLevel.NONE),
            transformation=resolved_levels.get(CapabilityDimension.TRANSFORMATION.value, AuthorityLevel.NONE),
            decoupling=resolved_levels.get(CapabilityDimension.DECOUPLING.value, AuthorityLevel.NONE),
            isolation=resolved_levels.get(CapabilityDimension.ISOLATION.value, AuthorityLevel.NONE),
            physical_control=resolved_levels.get(CapabilityDimension.PHYSICAL_CONTROL.value, AuthorityLevel.NONE),
            verification_confidence=final_confidence
        )
```

## 5. `protective_membrane/authority/drift.py`

```python
from dataclasses import dataclass
from typing import List
from protective_membrane.core.enums import CapabilityDimension, DriftSeverity
from protective_membrane.authority.vector import AuthorityVector

@dataclass(frozen=True)
class AuthorityDeltaResult:
    drift_detected: bool
    degraded_dimensions: List[CapabilityDimension]
    confidence_degraded: bool
    severity: DriftSeverity

@dataclass(frozen=True)
class AuthorityDelta:
    t0: AuthorityVector
    t1: AuthorityVector

    def evaluate(self) -> AuthorityDeltaResult:
        degraded = []
        severity = DriftSeverity.NONE

        for dim in CapabilityDimension:
            if self.t1.get_level(dim) < self.t0.get_level(dim):
                degraded.append(dim)
        
        conf_degraded = self.t1.verification_confidence < self.t0.verification_confidence
        
        if degraded or conf_degraded:
            if CapabilityDimension.ISOLATION in degraded or CapabilityDimension.PHYSICAL_CONTROL in degraded:
                severity = DriftSeverity.CRITICAL
            elif CapabilityDimension.DECOUPLING in degraded:
                severity = DriftSeverity.HIGH
            else:
                severity = DriftSeverity.MEDIUM

        return AuthorityDeltaResult(
            drift_detected=bool(degraded) or conf_degraded,
            degraded_dimensions=degraded,
            confidence_degraded=conf_degraded,
            severity=severity
        )
```

## 6. `protective_membrane/evidence/ledger.py`

```python
import json
import hashlib
from typing import List, Protocol
from dataclasses import dataclass, field
from datetime import datetime

@dataclass(frozen=True)
class EvidenceEvent:
    substrate_id: str
    event_type: str
    payload: dict
    timestamp: str = field(default_factory=lambda: datetime.utcnow().isoformat() + "Z")
    event_id: str = field(init=False)

    def __post_init__(self):
        raw_content = f"{self.substrate_id}|{self.event_type}|{json.dumps(self.payload, sort_keys=True)}|{self.timestamp}"
        hashed = hashlib.sha256(raw_content.encode('utf-8')).hexdigest()
        object.__setattr__(self, 'event_id', hashed)

class EvidenceSink(Protocol):
    def append(self, event: EvidenceEvent) -> None:
        ...
    def read_all(self) -> List[EvidenceEvent]:
        ...

class InMemoryEvidenceLedger(EvidenceSink):
    def __init__(self):
        self._log: List[EvidenceEvent] = []

    def append(self, event: EvidenceEvent) -> None:
        self._log.append(event)
        
    def read_all(self) -> List[EvidenceEvent]:
        return list(self._log)
```

## 7. `protective_membrane/policy/context.py`

```python
from dataclasses import dataclass
from typing import List, Optional
from protective_membrane.core.enums import PolicyAction, Classification
from protective_membrane.authority.vector import AuthorityVector
from protective_membrane.authority.evidence import CapabilityEvidence
from protective_membrane.authority.drift import AuthorityDeltaResult

@dataclass(frozen=True)
class PolicyRuleResult:
    passed: bool
    rationale: str

@dataclass(frozen=True)
class DecisionContext:
    substrate_id: str
    classification_status: Classification
    authority_vector: AuthorityVector
    drift_status: Optional[AuthorityDeltaResult]
    evidence_history: List[CapabilityEvidence]
    current_state_payload: dict

@dataclass(frozen=True)
class PolicyDecision:
    substrate_id: str
    selected_action: PolicyAction
    rationale: str
    required_authority_verified: bool
    rule_trace: tuple = ()
```
