from pydantic import BaseModel

class UserResponse(BaseModel):
    id: str
    email: str
    name: str

    class Config:
        from_attributes = True