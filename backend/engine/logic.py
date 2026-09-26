"""Three-valued (Kleene) evaluation of rule conditions.

A condition evaluates to True, False or None (cannot be decided from the facts).
Alongside the value we collect which facts were missing, so the user can be told
exactly what information would change the result.
"""
from __future__ import annotations

from dataclasses import dataclass, field

from engine.facts import FAMILY, POSSIBLE_VACCINE_INGREDIENTS, Facts, Tri, condition_label


@dataclass
class Outcome:
    value: Tri
    missing: set[str] = field(default_factory=set)


def _all(outcomes: list[Outcome]) -> Outcome:
    if any(o.value is False for o in outcomes):
        return Outcome(False)
    missing = set().union(*(o.missing for o in outcomes)) if outcomes else set()
    if any(o.value is None for o in outcomes):
        return Outcome(None, missing)
    return Outcome(True)


def _any(outcomes: list[Outcome]) -> Outcome:
    if any(o.value is True for o in outcomes):
        return Outcome(True)
    missing = set().union(*(o.missing for o in outcomes)) if outcomes else set()
    if any(o.value is None for o in outcomes):
        return Outcome(None, missing)
    return Outcome(False)


def _same_vaccine(reaction_vaccine: str, targets: list[str]) -> bool:
    fam = FAMILY.get(reaction_vaccine, reaction_vaccine)
    return any(FAMILY.get(t, t) == fam for t in targets)


def evaluate(cond: dict, facts: Facts, vaccine_id: str) -> Outcome:
    if "all" in cond:
        return _all([evaluate(c, facts, vaccine_id) for c in cond["all"]])
    if "any" in cond:
        return _any([evaluate(c, facts, vaccine_id) for c in cond["any"]])
    if "not" in cond:
        inner = evaluate(cond["not"], facts, vaccine_id)
        return Outcome(None if inner.value is None else not inner.value, inner.missing)
    if "fact" in cond:
        return _fact(cond, facts)
    if "condition" in cond:
        return _conditions(cond["condition"], facts)
    if "prior_reaction" in cond:
        targets = [vaccine_id if t == "self" else t for t in cond.get("after", ["self"])]
        return _prior_reaction(cond["prior_reaction"], targets, facts)
    if "component_allergy" in cond:
        return _component_allergy(set(cond["component_allergy"]), facts)
    raise ValueError(f"Unknown condition: {cond}")


def _fact(cond: dict, facts: Facts) -> Outcome:
    name = cond["fact"]
    value = facts.get(name)
    if value is None:
        return Outcome(None, {name})
    checks = []
    if "is" in cond:
        checks.append(value == cond["is"])
    if "gte" in cond:
        checks.append(value >= cond["gte"])
    if "gt" in cond:
        checks.append(value > cond["gt"])
    if "lt" in cond:
        checks.append(value < cond["lt"])
    if "lte" in cond:
        checks.append(value <= cond["lte"])
    return Outcome(all(checks))


def _conditions(codes: list[str], facts: Facts) -> Outcome:
    values = {c: facts.conditions.get(c) for c in codes}
    if any(v is True for v in values.values()):
        return Outcome(True)
    unknown = {c for c, v in values.items() if v is None}
    if unknown:
        return Outcome(None, {f"condition:{c}" for c in unknown})
    return Outcome(False)


def _prior_reaction(kind: str, targets: list[str], facts: Facts) -> Outcome:
    if facts.reaction_triage == "no":
        return Outcome(False)
    if facts.reaction_triage in (None, "unsure"):
        return Outcome(None, {"reactions"})
    matched_unknown = False
    for r in facts.reactions:
        relevant_vaccine = r.vaccine_id == "unknown" or _same_vaccine(r.vaccine_id, targets)
        if not relevant_vaccine:
            continue
        if r.kind == kind and r.vaccine_id != "unknown":
            return Outcome(True)
        if r.kind == kind or r.kind == "unsure":
            matched_unknown = True
    return Outcome(None, {"reactions"}) if matched_unknown else Outcome(False)


def _component_allergy(components: set[str], facts: Facts) -> Outcome:
    if facts.allergy_triage == "no":
        return Outcome(False)
    if facts.allergy_triage in (None, "unsure"):
        return Outcome(None, {"allergies"})
    undecided = False
    for a in facts.allergies:
        known_component = a.substance in components
        possible_component = (
            a.substance in POSSIBLE_VACCINE_INGREDIENTS or a.category == "vaccine_ingredient"
        )
        if a.severity == "anaphylaxis" and known_component:
            return Outcome(True)
        if a.severity in ("anaphylaxis", "unknown") and (known_component or possible_component):
            undecided = True
    return Outcome(None, {"allergies"}) if undecided else Outcome(False)


def describe_missing(missing: set[str]) -> list[str]:
    from engine.facts import FACT_LABELS

    labels = []
    for m in sorted(missing):
        label = condition_label(m.split(":", 1)[1]) if m.startswith("condition:") else FACT_LABELS.get(m, m)
        if label not in labels:
            labels.append(label)
    return labels
