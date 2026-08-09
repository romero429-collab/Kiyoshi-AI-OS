---
schema_version: "0.3"

artifact:
  id: "IMP-0002-SRC-PHASE4"
  type: "Implementation Source Code"
  title: "Protective Membrane Digital Twin - Phase 4 Policy Resolver"
  version: "0.3"

depends_on:
  - "IMP-0002-SRC"

provenance:
  authority:
    - "Constitution-v0.1-R Article IV"
  foundation:
    - "MS-0003"
    - "ADR-0003"
    - "ADR-0005"
  structure:
    - "AS-0002"
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
  last_reviewed: "2026-07-30"

ledger:
  id: "LEDGER-0019"
  state: "Accepted"
---

# IMP-0002: Digital Twin Source Code (Phase 4)

## 1. `protective_membrane/policy/rules.py`
The structural definition of ADR-0003 and the decoupled invariant evaluators.

```python
from dataclasses import dataclass
from typing import Optional, List
from protective_membrane.core.enums import (
    PolicyAction, CapabilityDimension, AuthorityLevel, Classification, DriftSeverity
)
from protective_membrane.policy.context import DecisionContext, PolicyRuleResult

@dataclass(frozen=True)
class ActionRequirement:
    action: PolicyAction
    required_dimension: Optional[CapabilityDimension]
    required_level: AuthorityLevel

# ADR-0003 Minimal Intervention Hierarchy (declarative)
MINIMAL_INTERVENTION_HIERARCHY: List[ActionRequirement] = [
    ActionRequirement(PolicyAction.PREVENT,   None,                          AuthorityLevel.NONE),
    ActionRequirement(PolicyAction.CONTAIN,   CapabilityDimension.RESTRICTION, AuthorityLevel.VERIFIED),
    ActionRequirement(PolicyAction.TRANSFORM, CapabilityDimension.TRANSFORMATION, AuthorityLevel.VERIFIED),
    ActionRequirement(PolicyAction.DECOUPLE,  CapabilityDimension.DECOUPLING,  AuthorityLevel.VERIFIED),
    ActionRequirement(PolicyAction.ISOLATE,   CapabilityDimension.ISOLATION,   AuthorityLevel.VERIFIED),
]

class AuthorityInvariant:
    def evaluate(self, context: DecisionContext, req: ActionRequirement) -> PolicyRuleResult:
        if req.required_dimension is None:
            return PolicyRuleResult(passed=True, rationale="No authority required.")
        if context.authority_vector.can_execute(req.required_dimension, req.required_level):
            return PolicyRuleResult(
                passed=True,
                rationale=f"Authorized: {req.required_dimension.value} >= {req.required_level.name}"
            )
        return PolicyRuleResult(
            passed=False,
            rationale=f"Unauthorized: lacks verified {req.required_dimension.value}"
        )

class ClassificationInvariant:
    def evaluate(self, context: DecisionContext, action: PolicyAction) -> PolicyRuleResult:
        c = context.classification_status

        if c == Classification.UNKNOWN:
            return PolicyRuleResult(passed=False, rationale="UNKNOWN forbids autonomous action.")

        if action == PolicyAction.PREVENT:
            # PREVENT is only valid before deep entanglement
            entangled = context.current_state_payload.get("entangled", True)
            if entangled:
                return PolicyRuleResult(passed=False, rationale="Already entangled - PREVENT unavailable.")
            return PolicyRuleResult(passed=True, rationale="PREVENT available (not yet entangled).")

        if action == PolicyAction.CONTAIN and c == Classification.UNSAFE:
            return PolicyRuleResult(passed=False, rationale="CONTAIN insufficient for UNSAFE state.")

        return PolicyRuleResult(passed=True, rationale=f"{action.name} permitted for {c.name}.")

class HighDriftInvariant:
    def evaluate(self, context: DecisionContext) -> PolicyRuleResult:
        if context.drift_status and context.drift_status.severity >= DriftSeverity.HIGH:
            return PolicyRuleResult(
                passed=False,
                rationale=f"High/Critical authority drift detected (severity={context.drift_status.severity.name})."
            )
        return PolicyRuleResult(passed=True, rationale="No high-severity drift.")
```

## 2. `protective_membrane/policy/resolver.py`
The pure deterministic engine.

```python
from typing import List
from protective_membrane.core.enums import PolicyAction
from protective_membrane.policy.context import DecisionContext, PolicyDecision, PolicyRuleResult
from protective_membrane.policy.rules import (
    MINIMAL_INTERVENTION_HIERARCHY,
    AuthorityInvariant,
    ClassificationInvariant,
    HighDriftInvariant,
)

class PolicyResolver:
    def __init__(self):
        self.auth_inv = AuthorityInvariant()
        self.class_inv = ClassificationInvariant()
        self.drift_inv = HighDriftInvariant()

    def resolve(self, context: DecisionContext) -> PolicyDecision:
        rule_trace: List[PolicyRuleResult] = []

        # 1. Global invariants (including High Drift)
        drift_check = self.drift_inv.evaluate(context)
        rule_trace.append(drift_check)
        if not drift_check.passed:
            # Drift failed -> still walk hierarchy, but only actions that remain authorized will be chosen.
            # If none remain, we fall through to ESCALATE.
            pass

        # 2. Hierarchy walk - first action that passes both Classification + Authority
        for req in MINIMAL_INTERVENTION_HIERARCHY:
            class_check = self.class_inv.evaluate(context, req.action)
            rule_trace.append(class_check)
            if not class_check.passed:
                continue

            auth_check = self.auth_inv.evaluate(context, req)
            rule_trace.append(auth_check)
            if not auth_check.passed:
                continue

            # Both passed -> this is the minimal verified intervention
            return PolicyDecision(
                substrate_id=context.substrate_id,
                selected_action=req.action,
                rationale=f"Minimal verified intervention: {req.action.name}",
                required_authority_verified=True,
                rule_trace=tuple(rule_trace)
            )

        # 3. No authorized safe action left -> Human Escalation
        return PolicyDecision(
            substrate_id=context.substrate_id,
            selected_action=PolicyAction.ESCALATE,
            rationale="ESCALATION REQUIRED: no verified safe action remains.",
            required_authority_verified=False,
            rule_trace=tuple(rule_trace)
        )
```
