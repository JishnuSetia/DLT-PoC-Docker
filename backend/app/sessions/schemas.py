from pydantic import BaseModel


class SessionMessage(BaseModel):
    role: str
    content: str