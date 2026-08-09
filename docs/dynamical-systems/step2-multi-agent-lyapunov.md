# Step 2 — Heterogeneous Multi-Agent Subsystem and Local Lyapunov Analysis (Kiyoshi × MH-FLOCKE)

Agent classes lifted from MH-FLOCKE into Kiyoshi:

- Reflex agents → hard constitutional safety filters and resource guards (local map \(F_{\rm ref}^{\rm K}\))
- CPG half-center oscillators → deterministic periodic scheduler / heartbeat loops (\(F_{\rm CPG}^{\rm K}\))
- SNN motor actors → local-model inference agents with adaptive prompt/weight updates (\(F_{\rm SNN}^{\rm K}\))
- Cerebellar forward-model agents → predictive error-correction and model-verification loops (\(F_{\rm cer}^{\rm K}\))
- Global Workspace competitors → attentional broadcast among concurrent tools/agents (\(F_{\rm GW}^{\rm K}\))
- Neuromodulatory agents → runtime priority / resource gating (\(F_{\rm nm}^{\rm K}\))
- Plasticity agents → skill / memory / constitution-weight adaptation (\(F_{\rm plas}^{\rm K}\))

Local Lyapunov exponent for class \(k\):

\[
\lambda_k(\mathbf{x}_0,T) = \frac{1}{T}\ln\Bigl\|\prod_{t=0}^{T-1}J_k^{\rm K}(\mathbf{x}_t)\Bigr\|.
\]

Positive exponents appear under high plasticity rates, excessive neuromodulator (priority) gains, or competence-gate values that push the scheduler into oscillatory instability. All pure safety-reflex and consistency-check maps remain contracting (\(\lambda_k<0\)) under the 12-article constitution bounds.
