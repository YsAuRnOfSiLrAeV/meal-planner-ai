from fastapi import APIRouter, Depends
from fastapi import HTTPException, status
from fastapi import Request
import httpx

from app.schemas.plan import GenerateRequest, DietPlan
from app.api.v1.deps import get_current_user
from app.llm.prompt_builder import build_prompt
from app.llm.client import chat
from app.llm.validator import parse_and_validate

from pydantic import ValidationError


router = APIRouter(tags=["plan"])


@router.post("/plan", response_model=DietPlan)
async def generate_plan(req: GenerateRequest, request: Request, user=Depends(get_current_user)):
	prompt = build_prompt(req)
	try:
		api_key = request.headers.get("X-OpenRouter-API-Key")
		raw = await chat(prompt, api_key_override=api_key if api_key else None)
		data = parse_and_validate(raw)
		
		if "aim" not in data and req.aim:
			data["aim"] = req.aim
		if "preparationStyle" not in data and req.preparationStyle:
			data["preparationStyle"] = req.preparationStyle
		plan = DietPlan.model_validate(data)
		return plan
	except httpx.HTTPStatusError as e:
		detail = e.response.text or "Upstream LLM error"
		raise HTTPException(
			status_code=status.HTTP_502_BAD_GATEWAY,
			detail=detail,
		)
	except ValidationError:
		raise HTTPException(
			status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
			detail="AI returned invalid/unfinished JSON",
		)
	except Exception:
		raise HTTPException(
			status_code=status.HTTP_502_BAD_GATEWAY,
			detail="AI upstream error",
		)
