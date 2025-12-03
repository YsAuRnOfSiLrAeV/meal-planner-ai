# Placeholder for future LLM integration via OpenRouter/OpenAI
from app.core.config import settings
import httpx


async def chat(prompt: str, api_key_override: str | None = None) -> str:
	if not (api_key_override or settings.OPENROUTER_API_KEY or settings.OPENAI_API_KEY):
		return '{"preparationStyle":"QUICK","days":[{"dayNumber":1,"meals":[{"mealNumber":1,"name":"Oatmeal with berries","ingredients":[]},{"mealNumber":2,"name":"Chicken with rice","ingredients":[]},{"mealNumber":3,"name":"Yogurt and banana","ingredients":[]},{"mealNumber":4,"name":"Salmon with potatoes","ingredients":[]}]}]}'

	api_key = api_key_override or settings.OPENROUTER_API_KEY or settings.OPENAI_API_KEY
	use_openrouter = bool(api_key_override or settings.OPENROUTER_API_KEY)
	base_url = (
		(settings.OPENROUTER_BASE_URL or "https://openrouter.ai/api").rstrip("/") + "/v1"
		if use_openrouter
		else "https://api.openai.com/v1"
	)
	model = settings.OPENAI_MODEL

	headers = {
		"Authorization": f"Bearer {api_key}",
		"Content-Type": "application/json",
	}
	if use_openrouter:
		headers["HTTP-Referer"] = "https://local.dev"
		headers["X-Title"] = "AI Meal Planner"

	payload = {
		"model": model,
		"messages": [
			{"role": "system", "content": "You are a nutrition planning assistant that returns pure JSON only."},
			{"role": "user", "content": prompt},
		],
		"temperature": 0.7,
	}

	url = f"{base_url}/chat/completions"

	async with httpx.AsyncClient(timeout=120) as client:
		resp = await client.post(url, headers=headers, json=payload)
		resp.raise_for_status()
		data = resp.json()
		content = (
			data.get("choices", [{}])[0]
			.get("message", {})
			.get("content", "")
		)
		return content or '{"days":[]}'
