from pydantic import BaseModel, field_validator
from typing import Literal


class LoginRequest(BaseModel):
    email: str
    password: str

    @field_validator('email')
    def validate_email(cls, v):
        # Simple validation - just check if it has @ and a dot
        if '@' not in v or '.' not in v:
            raise ValueError('Invalid email')
        return v


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str


class UserResponse(BaseModel):
    id: str
    email: str
    role: str

    class Config:
        from_attributes = True
