from typing import Dict, List

from .schemas import SessionMessage


class SessionManager:

    def __init__(self):
        self.sessions: Dict[str, List[SessionMessage]] = {}

    def create_session(self, session_id: str) -> None:
        if session_id not in self.sessions:
            self.sessions[session_id] = []

    def get_messages(
        self,
        session_id: str
    ) -> List[SessionMessage]:

        return self.sessions.get(
            session_id,
            []
        )

    def add_message(
        self,
        session_id: str,
        role: str,
        content: str
    ) -> None:

        self.create_session(session_id)

        self.sessions[session_id].append(
            SessionMessage(
                role=role,
                content=content
            )
        )

    def clear_session(
        self,
        session_id: str
    ) -> None:

        self.sessions.pop(
            session_id,
            None
        )


session_manager = SessionManager()