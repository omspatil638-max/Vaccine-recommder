"""Load and validate versioned guideline knowledge from data/knowledge/.

Each guideline set is a folder with guideline.json (metadata + sources) and a
vaccines/ folder of rule files. Validation fails loudly: a rule without a
traceable source never reaches the engine.
"""
from __future__ import annotations

import json
from dataclasses import dataclass
from functools import lru_cache
from pathlib import Path

KNOWLEDGE_DIR = Path(__file__).resolve().parents[2] / "data" / "knowledge"

VALID_STATUSES = {"RECOMMENDED", "MAY_BE_APPROPRIATE"}
SERIES_KINDS = {"seasonal", "booster", "series", "pneumococcal", "pregnancy_td"}
REQUIRED_SOURCE_FIELDS = {"id", "name", "publisher", "url", "retrieved_at"}


class KnowledgeError(ValueError):
    pass


@dataclass(frozen=True)
class GuidelineSet:
    meta: dict
    vaccines: dict[str, dict]

    @property
    def id(self) -> str:
        return self.meta["id"]

    @property
    def sources(self) -> dict[str, dict]:
        return {s["id"]: s for s in self.meta["sources"]}

    def summary(self) -> dict:
        keys = ("id", "jurisdiction", "name", "publisher", "version", "effective_from",
                "effective_to", "last_verified", "scope_note", "status_note", "population")
        return {k: self.meta.get(k) for k in keys}


def _validate(meta: dict, vaccines: dict[str, dict], folder: Path) -> None:
    errors: list[str] = []
    for key in ("id", "jurisdiction", "name", "version", "last_verified", "sources", "population"):
        if key not in meta:
            errors.append(f"{folder.name}/guideline.json: missing '{key}'")
    source_ids = set()
    for s in meta.get("sources", []):
        missing = REQUIRED_SOURCE_FIELDS - s.keys()
        if missing:
            errors.append(f"{folder.name}: source {s.get('id')} missing {sorted(missing)}")
        source_ids.add(s.get("id"))

    def check_rule(vid: str, rule: dict, where: str) -> None:
        if not rule.get("id"):
            errors.append(f"{vid} {where}: rule without id")
        if rule.get("source") not in source_ids:
            errors.append(f"{vid} {where} {rule.get('id')}: unknown source '{rule.get('source')}'")
        if not rule.get("section"):
            errors.append(f"{vid} {where} {rule.get('id')}: missing section reference")
        if "when" not in rule:
            errors.append(f"{vid} {where} {rule.get('id')}: missing 'when'")

    for vid, v in vaccines.items():
        if not v.get("indications"):
            errors.append(f"{vid}: no indications")
        for r in v.get("indications", []):
            check_rule(vid, r, "indication")
            if r.get("status") not in VALID_STATUSES:
                errors.append(f"{vid} {r.get('id')}: invalid status {r.get('status')}")
        for r in v.get("contraindications", []) + v.get("precautions", []):
            check_rule(vid, r, "safety")
        if v.get("immune_when"):
            check_rule(vid, v["immune_when"], "immunity")
        if v.get("series", {}).get("kind") not in SERIES_KINDS:
            errors.append(f"{vid}: invalid series kind")
        for sid in v.get("content", {}).get("sources", []):
            if sid not in source_ids:
                errors.append(f"{vid} content: unknown source '{sid}'")
    if errors:
        raise KnowledgeError("Knowledge validation failed:\n  " + "\n  ".join(errors))


def load_set(folder: Path) -> GuidelineSet:
    meta = json.loads((folder / "guideline.json").read_text(encoding="utf-8"))
    vaccines = {}
    for f in sorted((folder / "vaccines").glob("*.json")):
        v = json.loads(f.read_text(encoding="utf-8"))
        vaccines[v["id"]] = v
    _validate(meta, vaccines, folder)
    return GuidelineSet(meta=meta, vaccines=vaccines)


@lru_cache(maxsize=1)
def load_all() -> dict[str, GuidelineSet]:
    sets = {}
    for folder in sorted(p for p in KNOWLEDGE_DIR.iterdir() if (p / "guideline.json").exists()):
        gs = load_set(folder)
        sets[gs.id] = gs
    return sets


def set_for_jurisdiction(country_code: str | None) -> GuidelineSet | None:
    if not country_code:
        return None
    for gs in load_all().values():
        if gs.meta["jurisdiction"] == country_code:
            return gs
    return None
