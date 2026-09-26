"""Deterministic assessment: facts + guideline set -> explained, sourced statuses.

Precedence when resolving a vaccine's status (safest first):
  up to date (series complete)
  > contraindication identified
  > review with a healthcare professional (precaution, or a safety answer of "not sure")
  > more information needed
  > recommended / may be appropriate
Missing information can never produce "Recommended".
"""
from __future__ import annotations

from datetime import timedelta
from typing import Optional

from engine.facts import CONDITIONS, Facts
from engine.knowledge import GuidelineSet
from engine.logic import describe_missing, evaluate
from engine.series import Timing, compute

ENGINE_VERSION = "2.0.0"

STATUS_ORDER = [
    "RECOMMENDED",
    "MAY_BE_APPROPRIATE",
    "REVIEW_WITH_PROFESSIONAL",
    "INSUFFICIENT_INFORMATION",
    "CONTRAINDICATION",
    "UP_TO_DATE",
    "NOT_INDICATED",
]

HEADLINES = {
    "UP_TO_DATE": "Your answers show you're up to date with this vaccine.",
    "CONTRAINDICATION": "Based on your answers, this vaccine shouldn't be given right now without a healthcare professional's advice.",
    "REVIEW_WITH_PROFESSIONAL": "Something in your answers means a healthcare professional should check before you have this vaccine.",
    "INSUFFICIENT_INFORMATION": "We need more information to tell whether, or when, you need this vaccine.",
}

HISTORY_LABEL = {"received": "You've had it before", "not_received": "You haven't had it", "unknown": "Not sure"}


def _tri_text(v: Optional[bool], yes: str, no: str) -> str:
    return yes if v is True else no if v is False else "Not sure"


def _based_on(vaccine: dict, facts: Facts, gs: GuidelineSet, factors: set[str], timing: Optional[Timing],
              safety_state: str) -> list[dict]:
    items = []
    if "age" in factors:
        items.append({"factor": "age", "label": "Age", "value": f"{facts.age_years}" if facts.age_years is not None else "Not given"})
    if "pregnancy" in factors or facts.pregnant is True:
        items.append({"factor": "pregnancy", "label": "Pregnancy", "value": _tri_text(facts.pregnant, "Pregnant", "Not pregnant")})
    if "occupation" in factors:
        items.append({"factor": "occupation", "label": "Work in healthcare",
                      "value": _tri_text(facts.healthcare_personnel, "Yes", "No")})
    if "condition" in factors:
        present = [CONDITIONS[c] for c, v in facts.conditions.items() if v is True and c in CONDITIONS]
        if facts.immunocompromised:
            present.append("Weakened immune system")
        items.append({"factor": "condition", "label": "Health conditions", "value": ", ".join(present) or "None reported"})
    answer = facts.history.get(vaccine["id"])
    doses = [r for r in facts.records if r.vaccine_id == vaccine["id"]]
    history_value = HISTORY_LABEL.get(answer or "unknown")
    if doses:
        history_value = f"{len(doses)} dose{'s' if len(doses) != 1 else ''} recorded"
    items.append({"factor": "history", "label": "Vaccination history", "value": history_value})
    items.append({"factor": "safety", "label": "Safety screening", "value": safety_state})
    items.append({"factor": "location", "label": "Guideline", "value": f"{gs.meta['name']} ({gs.meta['version']})"})
    return items


def _pregnancy_timing(rule: dict, facts: Facts) -> Timing:
    """Timing for 'one dose every pregnancy' rules (e.g. Tdap weeks 27–36)."""
    window = rule.get("pregnancy_window", {})
    weeks = facts.pregnancy_weeks
    today = facts.today
    dated = [r.date for r in facts.records if r.vaccine_id == "tdap" and r.date]
    if weeks is not None:
        start = today - timedelta(weeks=weeks)
        this_pregnancy = [d for d in dated if d >= start]
        if this_pregnancy:
            return Timing("COMPLETE", 1, 1, notes=[f"You recorded a dose in this pregnancy on {max(this_pregnancy).isoformat()}."])
        from_week = window.get("from_week")
        to_week = window.get("preferred_to_week")
        if from_week and weeks < from_week:
            earliest = today + timedelta(weeks=from_week - weeks)
            latest = today + timedelta(weeks=to_week - weeks) if to_week else None
            return Timing("NOT_YET", 1, 0, 1, earliest, earliest, latest, False,
                          [f"Recommended from week {from_week} of pregnancy (around {earliest.isoformat()})."])
        note = f"The preferred window is weeks {from_week} to {to_week}." if from_week else ""
        return Timing("DUE", 1, 0, 1, today, today, None, True, [n for n in [note] if n])
    return Timing("DUE", 1, 0, 1, today, today, None, True, [
        f"It's preferably given early in weeks {window.get('from_week')} to {window.get('preferred_to_week')}. "
        "Tell us how many weeks pregnant you are to see the exact dates."
    ])


def _safety(vaccine: dict, facts: Facts) -> list[dict]:
    items = []
    for rule in vaccine.get("contraindications", []):
        out = evaluate(rule["when"], facts, vaccine["id"])
        if out.value is True:
            kind = rule.get("kind", "contraindication")
        elif out.value is None:
            kind = "unresolved"
        else:
            continue
        items.append({"ruleId": rule["id"], "kind": kind, "text": rule["text"], "sourceId": rule["source"],
                      "section": rule["section"], "missing": describe_missing(out.missing)})
    for rule in vaccine.get("precautions", []):
        out = evaluate(rule["when"], facts, vaccine["id"])
        if out.value is False:
            continue
        items.append({"ruleId": rule["id"], "kind": "precaution" if out.value else "unresolved", "text": rule["text"],
                      "sourceId": rule["source"], "section": rule["section"], "missing": describe_missing(out.missing)})
    if not vaccine.get("contraindications") and vaccine.get("safety_note"):
        out = evaluate({"prior_reaction": "anaphylaxis", "after": ["self"]}, facts, vaccine["id"])
        if out.value is not False:
            items.append({"ruleId": f"{vaccine['id']}-GENERAL-SAFETY", "kind": "unresolved" if out.value is None else "precaution",
                          "text": vaccine["safety_note"], "sourceId": None, "section": None,
                          "missing": describe_missing(out.missing)})
    return items


def evaluate_vaccine(vaccine: dict, facts: Facts, gs: GuidelineSet) -> dict:
    sources = gs.sources
    base = {
        "vaccineId": vaccine["id"],
        "name": vaccine["name"],
        "shortName": vaccine["short_name"],
        "protectsAgainst": vaccine["protects_against"],
        "live": vaccine.get("live", False),
    }

    # 1. Indication
    evaluated = [(r, evaluate(r["when"], facts, vaccine["id"])) for r in vaccine["indications"]]
    matched = [r for r, o in evaluated if o.value is True]
    undecided = [(r, o) for r, o in evaluated if o.value is None]
    rank = {"RECOMMENDED": 0, "MAY_BE_APPROPRIATE": 1}
    rule = min(matched, key=lambda r: rank[r["status"]]) if matched else None

    if rule is None and undecided:
        missing = set().union(*(o.missing for _, o in undecided))
        return {**base, "status": "INSUFFICIENT_INFORMATION", "headline": HEADLINES["INSUFFICIENT_INFORMATION"],
                "reasons": [_reason(r, sources) for r, _ in undecided], "missing": describe_missing(missing),
                "safety": [], "timing": None, "ruleIds": [r["id"] for r, _ in undecided],
                "basedOn": _based_on(vaccine, facts, gs, {f for r, _ in undecided for f in r["factors"]}, None, "Not checked yet"),
                "sources": _sources_for([r["source"] for r, _ in undecided], sources)}
    if rule is None:
        reason = vaccine.get("not_indicated_reason", "Your answers don't match the groups this vaccine is recommended for.")
        return {**base, "status": "NOT_INDICATED", "headline": reason, "reasons": [], "missing": [],
                "safety": [], "timing": None, "ruleIds": [r["id"] for r, _ in evaluated],
                "basedOn": _based_on(vaccine, facts, gs, {f for r, _ in evaluated for f in r["factors"]}, None, "Not needed"),
                "sources": _sources_for([r["source"] for r, _ in evaluated], sources)}

    reasons = [_reason(rule, sources)]
    rule_ids = [rule["id"]]
    factors = set(rule["factors"])

    # 2. Evidence of immunity
    immune = vaccine.get("immune_when")
    if immune and evaluate(immune["when"], facts, vaccine["id"]).value is True:
        return {**base, "status": "UP_TO_DATE", "headline": immune["reason"], "reasons": reasons + [_reason(immune, sources)],
                "missing": [], "safety": [], "timing": None, "ruleIds": rule_ids + [immune["id"]],
                "basedOn": _based_on(vaccine, facts, gs, factors, None, "Not needed"),
                "sources": _sources_for([rule["source"], immune["source"]], sources)}

    # 3. Dose history and timing
    if rule.get("every_pregnancy"):
        timing = _pregnancy_timing(rule, facts)
    else:
        timing = compute(vaccine, facts, rule.get("doses_required"), facts.history.get(vaccine["id"]),
                         gs.meta.get("flu_season_start"))

    # 4. Safety (vaccine-specific)
    safety = _safety(vaccine, facts)
    hard = [s for s in safety if s["kind"] in ("contraindication", "defer")]
    soft = [s for s in safety if s["kind"] in ("precaution", "unresolved")]
    safety_state = (
        "A contraindication applies" if hard else
        "Needs a professional's check" if soft else
        "No concerns found in your answers"
    )
    missing = []
    for s in soft:
        missing += [m for m in s["missing"] if m not in missing]

    # 5. Resolve
    if timing.state == "COMPLETE":
        status, headline = "UP_TO_DATE", HEADLINES["UP_TO_DATE"]
        safety, missing = [], []
    elif hard:
        status, headline = "CONTRAINDICATION", HEADLINES["CONTRAINDICATION"]
    elif soft or timing.state == "NEEDS_REVIEW":
        status, headline = "REVIEW_WITH_PROFESSIONAL", HEADLINES["REVIEW_WITH_PROFESSIONAL"]
    elif timing.state == "UNKNOWN":
        status, headline = "INSUFFICIENT_INFORMATION", HEADLINES["INSUFFICIENT_INFORMATION"]
        missing.append("Records of your previous doses")
    else:
        status, headline = rule["status"], rule["reason"]

    source_ids = [rule["source"]] + [s["sourceId"] for s in safety if s["sourceId"]]
    return {**base, "status": status, "headline": headline, "reasons": reasons, "missing": missing,
            "safety": safety, "timing": timing.as_dict(), "ruleIds": rule_ids + [s["ruleId"] for s in safety],
            "basedOn": _based_on(vaccine, facts, gs, factors | {"history", "safety"}, timing, safety_state),
            "sources": _sources_for(source_ids, sources)}


def _reason(rule: dict, sources: dict) -> dict:
    return {"ruleId": rule["id"], "text": rule["reason"], "factors": rule.get("factors", []),
            "sourceId": rule["source"], "section": rule["section"]}


def _sources_for(ids: list[str], sources: dict) -> list[dict]:
    seen, out = set(), []
    for sid in ids:
        if sid and sid not in seen and sid in sources:
            seen.add(sid)
            out.append(sources[sid])
    return out


def assess(facts: Facts, gs: Optional[GuidelineSet]) -> dict:
    """Run a full assessment. Fails closed: no guideline, no results."""
    run = {"engineVersion": ENGINE_VERSION, "evaluatedOn": facts.today.isoformat(),
           "guidelineSet": gs.summary() if gs else None, "results": [], "missing": []}

    if gs is None:
        return {**run, "outcome": "NO_GUIDELINE",
                "message": "We don't have vaccination guidelines for your country yet, so we can't assess your vaccinations. "
                           "Your national health ministry or a healthcare professional can advise you."}
    if facts.age_years is None:
        return {**run, "outcome": "INSUFFICIENT_INFORMATION", "missing": ["Your date of birth"],
                "message": "We need your date of birth to work out which vaccinations may be relevant."}

    pop = gs.meta["population"]
    if pop.get("min_age_years") and facts.age_years < pop["min_age_years"]:
        return {**run, "outcome": "POPULATION_NOT_COVERED",
                "message": f"The guideline we use for your country covers {pop['description'].lower()}. "
                           "Vaccination schedules for younger people are different, so please ask a healthcare professional."}
    if pop.get("pregnant_only"):
        if facts.pregnant is None:
            return {**run, "outcome": "INSUFFICIENT_INFORMATION", "missing": ["Whether you're pregnant"],
                    "message": "For India, the national schedule for adults applies to pregnant women. Tell us whether you're pregnant to continue."}
        if facts.pregnant is False:
            return {**run, "outcome": "POPULATION_NOT_COVERED",
                    "message": gs.meta.get("scope_note", "The national schedule doesn't cover your group.")}

    results = [evaluate_vaccine(v, facts, gs) for v in gs.vaccines.values()]
    order = {s: i for i, s in enumerate(STATUS_ORDER)}
    results.sort(key=lambda r: (order[r["status"]], not (r.get("timing") or {}).get("dueNow", False), r["shortName"]))
    counts = {s: sum(1 for r in results if r["status"] == s) for s in STATUS_ORDER}
    return {**run, "outcome": "COMPLETE", "message": None, "results": results, "counts": counts}
