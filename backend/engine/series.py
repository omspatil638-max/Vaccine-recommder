"""Dose counting and timing. All interval arithmetic happens here, in code."""
from __future__ import annotations

from dataclasses import dataclass, field
from datetime import date, timedelta
from typing import Optional

from engine.facts import DoseRecord, Facts


@dataclass
class Timing:
    state: str  # COMPLETE | DUE | NOT_YET | UNKNOWN | NEEDS_REVIEW
    doses_required: int = 0
    doses_counted: int = 0
    next_dose: Optional[int] = None
    earliest_date: Optional[date] = None
    recommended_date: Optional[date] = None
    latest_recommended_date: Optional[date] = None
    due_now: bool = False
    notes: list[str] = field(default_factory=list)
    counted_dates: list[Optional[date]] = field(default_factory=list)

    def as_dict(self) -> dict:
        iso = lambda d: d.isoformat() if d else None  # noqa: E731
        return {
            "state": self.state,
            "dosesRequired": self.doses_required,
            "dosesCounted": self.doses_counted,
            "nextDose": self.next_dose,
            "earliestDate": iso(self.earliest_date),
            "recommendedDate": iso(self.recommended_date),
            "latestRecommendedDate": iso(self.latest_recommended_date),
            "dueNow": self.due_now,
            "notes": self.notes,
            "countedDates": [iso(d) for d in self.counted_dates],
        }


def _records(facts: Facts, vaccine_id: str) -> list[DoseRecord]:
    return [r for r in facts.records if r.vaccine_id == vaccine_id]


def season_start(today: date, month: int, day: int) -> date:
    start = date(today.year, month, day)
    return start if today >= start else date(today.year - 1, month, day)


def _count_valid(dated: list[date], doses: list[dict], notes: list[str]) -> list[date]:
    """Count doses in date order, skipping any given before its minimum interval."""
    valid: list[date] = []
    for d in sorted(dated):
        if len(valid) >= len(doses):
            break
        spec = doses[len(valid)]
        if valid:
            min_prev = spec.get("min_after_prev_days")
            min_first = spec.get("min_after_first_days")
            too_soon = (min_prev and (d - valid[-1]).days < min_prev) or (
                min_first and (d - valid[0]).days < min_first
            )
            if too_soon:
                notes.append(
                    f"A dose on {d.isoformat()} was given sooner than the minimum interval, so it isn't counted. "
                    "A professional can confirm whether it needs repeating."
                )
                continue
        valid.append(d)
    return valid


def _next_dates(valid: list[date], spec: dict) -> tuple[Optional[date], Optional[date], Optional[date]]:
    if not valid:
        return None, None, None
    prev, first = valid[-1], valid[0]
    earliest = prev + timedelta(days=spec.get("min_after_prev_days", 0))
    if spec.get("min_after_first_days"):
        earliest = max(earliest, first + timedelta(days=spec["min_after_first_days"]))
    rec = None
    if spec.get("rec_after_first_days"):
        rec = first + timedelta(days=spec["rec_after_first_days"])
    elif spec.get("rec_after_prev_days"):
        rec = prev + timedelta(days=spec["rec_after_prev_days"])
    if rec and rec < earliest:
        rec = earliest
    latest = prev + timedelta(days=spec["rec_latest_after_prev_days"]) if spec.get("rec_latest_after_prev_days") else None
    return earliest, rec, latest


def compute(
    vaccine: dict,
    facts: Facts,
    doses_required: Optional[int] = None,
    history_answer: Optional[str] = None,
    season: Optional[dict] = None,
) -> Timing:
    series = vaccine["series"]
    kind = series["kind"]
    doses = series["doses"]
    required = doses_required or len(doses)
    recs = _records(facts, vaccine["id"])
    dated = [r.date for r in recs if r.date]
    undated = [r for r in recs if not r.date]
    answer = history_answer or ("received" if recs else "unknown")
    notes: list[str] = []
    today = facts.today

    if answer == "unknown" and not recs:
        return Timing("UNKNOWN", required, notes=["You weren't sure whether you've had this vaccine before."])
    if answer == "not_received" and not recs:
        return Timing("DUE", required, 0, 1, today, today, due_now=True)
    if answer == "received" and not recs and kind != "pneumococcal":
        return Timing("UNKNOWN", required, notes=[
            "You said you've had this vaccine, but no doses or dates were added, so we can't tell what's next."
        ])

    if kind == "seasonal":
        start = season_start(today, season["month"], season["day"]) if season else today
        this_season = [d for d in dated if d >= start]
        if this_season:
            last = max(this_season)
            return Timing("COMPLETE", 1, 1, notes=[f"You recorded a dose this season on {last.isoformat()}."],
                          counted_dates=[last])
        if undated:
            return Timing("UNKNOWN", 1, notes=["You recorded a flu vaccine without a date, so we can't tell if it was this season."])
        return Timing("DUE", 1, 0, 1, today, today, due_now=True)

    if kind == "booster":
        every = series["booster_every_days"]
        if dated:
            last = max(dated)
            nxt = last + timedelta(days=every)
            if nxt > today:
                return Timing("COMPLETE", 1, 1, recommended_date=nxt,
                              notes=[f"Your last dose was on {last.isoformat()}. The next booster is due around {nxt.isoformat()}."],
                              counted_dates=[last])
            return Timing("DUE", 1, 0, 1, today, today, due_now=True,
                          notes=[f"Your last recorded dose was on {last.isoformat()}, more than 10 years ago."])
        return Timing("UNKNOWN", 1, notes=["You've had this vaccine, but without a date we can't tell when your next booster is due."])

    if kind == "pneumococcal":
        products = {r.product for r in recs}
        if products & set(series.get("complete_products", [])):
            return Timing("COMPLETE", 1, 1, notes=["You recorded a PCV20 or PCV21 dose. No further pneumococcal dose is recommended."])
        return Timing("NEEDS_REVIEW", 1, notes=[
            "You've had a pneumococcal vaccine, but whether you need another depends on which one. A professional can check your records."
        ])

    if kind == "pregnancy_td":
        return _pregnancy_td(series, facts, recs, notes)

    # Multi-dose series
    valid = _count_valid(dated, doses, notes)
    counted = len(valid)
    if undated:
        notes.append(f"{len(undated)} dose(s) were recorded without a date, so the timing of the next dose can't be checked.")
        if counted + len(undated) >= required:
            return Timing("COMPLETE", required, counted + len(undated), notes=notes, counted_dates=valid + [None] * len(undated))
        if counted == 0:
            return Timing("UNKNOWN", required, len(undated), notes=notes)
    if counted >= required:
        return Timing("COMPLETE", required, counted, notes=notes, counted_dates=valid)
    spec = doses[counted]
    earliest, rec, latest = _next_dates(valid, spec)
    if earliest is None:
        return Timing("DUE", required, counted, counted + 1, today, today, due_now=True, notes=notes, counted_dates=valid)
    due_now = earliest <= today
    return Timing(
        "DUE" if due_now else "NOT_YET", required, counted, counted + 1,
        earliest, rec, latest, due_now, notes, valid,
    )


def _pregnancy_td(series: dict, facts: Facts, recs: list[DoseRecord], notes: list[str]) -> Timing:
    today = facts.today
    dated = sorted(r.date for r in recs if r.date)
    if any(not r.date for r in recs):
        return Timing("NEEDS_REVIEW", 2, notes=[
            "Some Td/TT doses were recorded without dates, so we can't tell which schedule applies. A health worker can check your card."
        ])
    if facts.pregnancy_weeks is None:
        if dated and (today - dated[-1]).days < 300:
            return Timing("NEEDS_REVIEW", 2, notes=[
                "You recorded a recent Td/TT dose, but without knowing how many weeks pregnant you are we can't tell if it was in this pregnancy."
            ])
        pregnancy_start = None
    else:
        pregnancy_start = today - timedelta(weeks=facts.pregnancy_weeks)

    in_pregnancy = [d for d in dated if pregnancy_start and d >= pregnancy_start]
    before = [d for d in dated if not pregnancy_start or d < pregnancy_start]
    recent_prior = [d for d in before if (today - d).days <= series["booster_if_vaccinated_within_days"]]

    if recent_prior:
        if in_pregnancy:
            return Timing("COMPLETE", 1, 1, notes=["You had a booster dose in this pregnancy."], counted_dates=in_pregnancy[:1])
        notes.append(f"You were vaccinated within the last 3 years ({recent_prior[-1].isoformat()}), so one booster dose is enough.")
        return Timing("DUE", 1, 0, 1, today, today, due_now=True, notes=notes)

    valid = _count_valid(in_pregnancy, series["doses"], notes)
    if len(valid) >= 2:
        return Timing("COMPLETE", 2, 2, notes=notes, counted_dates=valid)
    if not valid:
        return Timing("DUE", 2, 0, 1, today, today, due_now=True, notes=notes)
    earliest, rec, _ = _next_dates(valid, series["doses"][1])
    return Timing("DUE" if earliest <= today else "NOT_YET", 2, 1, 2, earliest, rec, None, earliest <= today, notes, valid)
