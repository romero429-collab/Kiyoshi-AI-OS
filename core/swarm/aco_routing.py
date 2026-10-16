#!/usr/bin/env python3
"""
Kiyoshi ACO Stigmergic Routing Layer (v9.6)
Distributed pheromone map + Metabolic Task State Machine + Artifact Overrides.
"""

import numpy as np
import logging
from enum import Enum
from typing import Dict, List

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("ACORouting")

class TaskState(Enum):
    EXPLORE = "EXPLORE"
    RELAY = "RELAY"
    RETURN = "RETURN"
    CHARGE = "CHARGE"

class ACORoutingLayer:
    def __init__(self, alpha: float = 1.0, beta: float = 2.0, rho: float = 0.1):
        self.alpha = alpha
        self.beta = beta
        self.rho = rho
        self.pheromone_map: Dict = {}
        self.genesis_pheromone = 10.0
        self.genesis_node = 0
        self.override_state = "NORMAL"
        self.current_task = TaskState.EXPLORE
        self.battery_level = 1.0

    def apply_artifact_override(self, event_type: str):
        self.override_state = event_type
        if event_type == "SIG_MANUAL_PARTITION":
            self.current_task = TaskState.RETURN
            self.beta = -5.0
        elif event_type == "SIG_FORCE_GRAFT":
            self.current_task = TaskState.RELAY
            self.deposit_pheromone(self.genesis_node, 999, 9999.0)
        elif event_type == "SIG_DEEP_OBSERVER":
            self.current_task = TaskState.RELAY
            self.alpha = 0.0
            self.beta = 0.0
            self.rho = 0.9

    def deposit_pheromone(self, i: int, j: int, base_amount: float):
        energy_factor = np.tanh(2.0 * self.battery_level)
        amount = base_amount * energy_factor
        edge = (min(i, j), max(i, j))
        self.pheromone_map[edge] = self.pheromone_map.get(edge, 0.0) + amount

    def update_battery(self, level: float):
        self.battery_level = max(0.0, min(1.0, level))
        if self.battery_level < 0.15 and self.current_task != TaskState.CHARGE:
            self.current_task = TaskState.RETURN
