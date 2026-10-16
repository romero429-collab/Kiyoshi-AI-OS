#!/usr/bin/env python3
"""
Kiyoshi Colony Identity Engine (v9.6)
Persistent composite identity + revocable leadership certificates for Colony Beacons.
"""

import hashlib
import json
import time
import logging
from typing import Dict, List, Optional

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("ColonyIdentity")

class ColonyIdentityEngine:
    def __init__(self, colony_name: str, founding_nodes: List[str]):
        self.colony_name = colony_name
        self.founding_nodes = sorted(founding_nodes)
        self.creation_time = time.time()
        self.current_leader: Optional[str] = None
        self.leadership_certificates: Dict[str, dict] = {}
        self.composite_hash = self._compute_composite_hash()

    def _compute_composite_hash(self) -> str:
        payload = {
            "name": self.colony_name,
            "founders": self.founding_nodes,
            "created": self.creation_time
        }
        return hashlib.sha256(json.dumps(payload, sort_keys=True).encode()).hexdigest()

    def issue_leadership_certificate(self, node_id: str, duration_seconds: int = 3600) -> dict:
        cert = {
            "node_id": node_id,
            "colony_hash": self.composite_hash,
            "issued_at": time.time(),
            "expires_at": time.time() + duration_seconds,
            "signature": hashlib.sha256(f"{node_id}:{self.composite_hash}:{time.time()}".encode()).hexdigest()
        }
        self.leadership_certificates[node_id] = cert
        self.current_leader = node_id
        logger.info(f"Leadership certificate issued to {node_id}")
        return cert

    def revoke_leadership(self, node_id: str, reason: str = "vote_of_no_confidence"):
        if node_id in self.leadership_certificates:
            del self.leadership_certificates[node_id]
            if self.current_leader == node_id:
                self.current_leader = None
            logger.warning(f"Leadership revoked for {node_id}: {reason}")

    def verify_certificate(self, cert: dict) -> bool:
        if time.time() > cert.get("expires_at", 0):
            return False
        expected = hashlib.sha256(f"{cert['node_id']}:{cert['colony_hash']}:{cert['issued_at']}".encode()).hexdigest()
        return expected == cert.get("signature")
