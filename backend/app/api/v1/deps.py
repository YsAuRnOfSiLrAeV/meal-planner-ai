from fastapi import HTTPException, status, Request
from typing import Any, Dict


def get_current_user(request: Request) -> Dict[str, Any]:
	auth = request.headers.get("Authorization", "")
	if not auth.startswith("Bearer ") or len(auth.split(" ", 1)[1].strip()) == 0:
		raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthorized")
	return {"id": "demo-user", "sub": "demo-user", "provider": "stub"}
