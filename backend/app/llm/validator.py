from typing import Any, Dict
import json


def clean_ai_json(s: str | None) -> str | None:
	if s is None:
		return None
	t = s.strip()
	if t.startswith("```"):
		nl = t.find("\n")
		if nl > 0:
			t = t[nl + 1 :].strip()
	if t.endswith("```"):
		t = t[:-3].strip()
	return t


def parse_and_validate(raw: str) -> Dict[str, Any]:
	cleaned = clean_ai_json(raw) or "{}"
	return json.loads(cleaned)
