from datetime import datetime
from pydantic import BaseModel, Field, EmailStr

class UserBase(BaseModel):
    provider: str = Field(..., max_length=32)
    provider_sub: str = Field(..., max_length=128)
    email: EmailStr
    name: str = Field(..., max_length=200)

class UserUpsert(UserBase):
    pass

class UserRead(BaseModel):
    id: str
    provider: str
    provider_sub: str
    email: EmailStr
    name: str
    created_at: datetime
    model_config = dict(from_attributes=True)


class UserDeleteRequest(BaseModel):
    email: EmailStr