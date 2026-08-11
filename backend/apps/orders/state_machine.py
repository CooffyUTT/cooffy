"""Canonical order state machine (RF-07 / RN-13 / RN-14 / RN-15).

Single source of truth for the valid ``Order.State`` transitions. Both the
viewset and the tests must rely on this module instead of duplicating the
transition table.
"""
from __future__ import annotations

from typing import Mapping

ALL_STATES = (
    "pending",
    "preparing",
    "ready",
    "picked_up",
    "rejected",
)

VALID_TRANSITIONS: Mapping[str, frozenset[str]] = {
    "pending": frozenset({"preparing", "rejected"}),
    "preparing": frozenset({"ready", "rejected"}),
    "ready": frozenset({"picked_up", "rejected"}),
    "picked_up": frozenset(),
    "rejected": frozenset(),
}

TERMINAL_STATES = frozenset({"picked_up", "rejected"})


def _normalize(state) -> str:
    """Return the canonical string value for an ``Order.State`` member or raw string."""
    return str(getattr(state, "value", state))


def can_transition(from_state, to_state) -> bool:
    """Return whether ``to_state`` is a valid next state for ``from_state``."""
    return _normalize(to_state) in VALID_TRANSITIONS.get(_normalize(from_state), frozenset())


def is_terminal(state) -> bool:
    """Return whether the state has no outgoing transitions."""
    return _normalize(state) in TERMINAL_STATES


def allowed_next_states(state) -> list[str]:
    """Return the sorted list of valid next states for the given state."""
    return sorted(VALID_TRANSITIONS.get(_normalize(state), frozenset()))
