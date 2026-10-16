import numpy as np

class DualQuaternionMath:
    @staticmethod
    def multiply(q1, q2):
        w1, x1, y1, z1 = q1
        w2, x2, y2, z2 = q2
        return np.array([
            w1*w2 - x1*x2 - y1*y2 - z1*z2,
            w1*x2 + x1*w2 + y1*z2 - z1*y2,
            w1*y2 - x1*z2 + y1*w2 + z1*x2,
            w1*z2 + x1*y2 - y1*x2 + z1*w2
        ])

    @staticmethod
    def conjugate(q):
        return np.array([q[0], -q[1], -q[2], -q[3]])

    @staticmethod
    def dual_multiply(dq1, dq2):
        r1, d1 = dq1[:4], dq1[4:]
        r2, d2 = dq2[:4], dq2[4:]
        r_out = DualQuaternionMath.multiply(r1, r2)
        d_out = DualQuaternionMath.multiply(r1, d2) + DualQuaternionMath.multiply(d1, r2)
        return np.concatenate((r_out, d_out))

    @staticmethod
    def normalize(dq):
        r, d = dq[:4], dq[4:]
        r_norm = np.linalg.norm(r)
        if r_norm < 1e-12:
            return np.array([1., 0., 0., 0., 0., 0., 0., 0.])
        r_clean = r / r_norm
        d_clean = d - np.dot(r_clean, d) * r_clean
        return np.concatenate((r_clean, d_clean))

    @staticmethod
    def compute_dual_error_norm(dq_true, dq_cmd):
        r_inv = DualQuaternionMath.conjugate(dq_cmd[:4])
        d_inv = -DualQuaternionMath.conjugate(dq_cmd[4:])
        dq_inv = np.concatenate((r_inv, d_inv))
        dq_err = DualQuaternionMath.dual_multiply(dq_true, dq_inv)
        r_err, d_err = dq_err[:4], dq_err[4:]
        return np.sqrt(np.linalg.norm(r_err[1:])**2 + np.linalg.norm(d_err[1:])**2)


class ExecutiveCoreSensorimotor:
    def __init__(self):
        self.kappa_0 = 0.5
        self.alpha = 0.1
        self.beta_p = 1.2
        self.gamma_p = 0.05
        self.beta_m = 1.5
        self.gamma_m = 0.08

    def step(self, lambda_1, e_p_norm, tau_p, dq_cmd, dual_omega):
        tau_m = np.random.randint(2, 6) if np.random.random() < 0.12 else 0
        dq_true = DualQuaternionMath.normalize(dq_cmd + np.random.randn(8) * 0.015)
        e_m_norm = DualQuaternionMath.compute_dual_error_norm(dq_true, dq_cmd)

        dynamic_term = max(0.0,
            lambda_1 +
            self.beta_p * e_p_norm + self.gamma_p * tau_p +
            self.beta_m * e_m_norm + self.gamma_m * tau_m
        )
        kappa_k = self.kappa_0 + self.alpha * dynamic_term

        return {
            'dq_true': dq_true,
            'e_m_norm': e_m_norm,
            'tau_m': tau_m,
            'kappa_k': kappa_k
        }
