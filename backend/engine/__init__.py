"""Deterministic vaccination assessment engine. No I/O beyond reading knowledge files."""
from engine.evaluate import ENGINE_VERSION, STATUS_ORDER, assess, evaluate_vaccine
from engine.facts import CONDITIONS, Allergy, DoseRecord, Facts, Reaction
from engine.knowledge import GuidelineSet, KnowledgeError, load_all, set_for_jurisdiction

__all__ = [
    "ENGINE_VERSION", "STATUS_ORDER", "assess", "evaluate_vaccine", "CONDITIONS", "Allergy", "DoseRecord",
    "Facts", "Reaction", "GuidelineSet", "KnowledgeError", "load_all", "set_for_jurisdiction",
]
