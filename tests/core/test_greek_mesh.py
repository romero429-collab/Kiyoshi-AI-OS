import pytest
import numpy as np
from core.greek_mesh import GreekMeshCouncil, QuaternionNode, OctonionByte

def test_quadrant_i_logistic_stability():
    council = GreekMeshCouncil()
    val = council.evaluate_quadrant_i(0.5)
    assert 0.0 <= val <= 1.0

def test_quaternion_slerp_norm():
    q1 = QuaternionNode(np.array([1.0, 0.0, 0.0, 0.0]))
    q2 = QuaternionNode(np.array([0.0, 1.0, 0.0, 0.0]))
    slerped = q1.slerp(q2, 0.5)
    assert np.isclose(np.linalg.norm(slerped.q), 1.0, atol=1e-6)

def test_octonion_byte_norm():
    o1 = OctonionByte(np.array([1.0, 2.0, 3.0, 4.0, 0.0, 0.0, 0.0, 0.0]))
    o2 = OctonionByte(np.array([0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5]))
    res = o1.multiply(o2)
    assert np.isclose(np.linalg.norm(res.coords), 1.0, atol=1e-6)

def test_constitutional_enforcer_lockout():
    council = GreekMeshCouncil()
    assert council.evaluate_quadrant_iv(0.5) is True
    assert council.evaluate_quadrant_iv(0.99) is False

def test_full_mesh_cycle():
    council = GreekMeshCouncil()
    ok, final_val, lyap = council.execute_full_cycle()
    assert isinstance(ok, bool)
    assert 0.0 <= final_val <= 1.0
    assert isinstance(lyap, float)

def test_lyapunov_positive_chaos():
    council = GreekMeshCouncil()
    lyap = council.estimate_lyapunov_i()
    assert lyap > 0.0  # chaotic regime at r=3.9

def test_error_quaternion():
    q = QuaternionNode(np.array([0.7071, 0.7071, 0.0, 0.0]))
    ref = QuaternionNode()
    err = q.error_quaternion(ref)
    assert np.isclose(np.linalg.norm(err), 1.0, atol=1e-6)

def test_constitutional_matrix():
    council = GreekMeshCouncil()
    state = np.full(24, 0.5)
    assert council.constitutional_check(state) is True
    state[0] = 0.99
    assert council.constitutional_check(state) is False

def test_norm_preservation_cycle():
    council = GreekMeshCouncil()
    q_norm_before = np.linalg.norm(council.quaternion_state.q)
    o_norm_before = np.linalg.norm(council.octonion_state.coords)
    council.execute_full_cycle()
    assert np.isclose(np.linalg.norm(council.quaternion_state.q), q_norm_before, atol=1e-6)
    assert np.isclose(np.linalg.norm(council.octonion_state.coords), o_norm_before, atol=1e-6)
