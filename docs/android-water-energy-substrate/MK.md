# MK: Build Configuration Engine

Config state: vector of parameters \(\mathbf{c}_t = (A_{\rm gyro}, \eta_F, \eta_S, \eta_E)^\top\)

Iteration: dependency resolution map that clamps to stable range and verifies contraction (\(\rho < 1\)).

Executable: Python script that iterates until fixed point of build config.

Error: missing param jumps to recovery attractor with retry.