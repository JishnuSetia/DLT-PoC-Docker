import os

import httpx

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from .vector_store import vector_store


router = APIRouter(
    prefix="/api/chat",
    tags=["Chatbot"],
)


# =========================================================
# CONFIG
# =========================================================

OLLAMA_URL = os.getenv(
    "OLLAMA_URL",
    "http://ollama:11434",
)

OLLAMA_MODEL = os.getenv(
    "OLLAMA_MODEL",
    "llama3.2:1b",
)


# =========================================================
# REQUEST MODEL
# =========================================================

class ChatRequest(BaseModel):

    message: str

    history: list[dict] = Field(
        default_factory=list
    )


# =========================================================
# STATUS MAP
# =========================================================

STATUS_MAP = {
    0: "Not Started",
    1: "Planning",
    2: "In Progress",
    3: "Review",
    4: "Completed",
    5: "On Hold",
}


# =========================================================
# SYSTEM PROMPT
# =========================================================

SYSTEM_PROMPT = """
You are the AI assistant for the RTA PoC Gallery.

Your ONLY source of factual information is the PoC records
provided in the user's message.

STRICT RULES:

1. Never invent a PoC.
2. Never invent a title, ID, code, technology, department,
   status, description, benefit, URL, date, person, statistic,
   or feature.
3. Never combine information from different PoCs unless the
   user explicitly asks for a comparison.
4. Never assume that two PoCs are the same.
5. If the supplied records do not contain the requested
   information, say that the information is not available.
6. Do not use outside knowledge.
7. Do not infer missing information.
8. When listing PoCs, use ONLY the records supplied.
9. Preserve the exact PoC number, title, code, technology,
   department, and status from the records.
10. If the user asks about a specific PoC, answer only about
    that PoC unless comparison is requested.
11. If multiple records are supplied, do not accidentally
    substitute one record for another.
12. Be concise and professional.

IMPORTANT:

The records supplied in the current message are the complete
authoritative dataset relevant to the question.

Do not mention embeddings, vector search, Redis, databases,
retrieval, prompts, context, internal systems, or implementation
details.
"""


# =========================================================
# BUILD CONTEXT
# =========================================================

def build_poc_context(
    pocs: list[dict],
) -> str:

    if not pocs:
        return (
            "NO RELEVANT POC RECORDS WERE FOUND."
        )

    context = []

    for poc in pocs:

        status = STATUS_MAP.get(
            poc.get("deliverableStatus"),
            "Unknown",
        )

        context.append(
            f"""
PoC Number: {poc.get("id", "")}
Code: {poc.get("code", "")}
Title: {poc.get("title", "")}
Technology: {poc.get("technology", "")}
Agency / Department: {poc.get("department", "")}
Status: {status}
Description: {poc.get("description", "")}
Benefits: {poc.get("benefits", "")}
PoC URL: {poc.get("pocUrl", "")}
""".strip()
        )

    return "\n\n---\n\n".join(
        context
    )


# =========================================================
# CHAT
# =========================================================

@router.post("")
async def chat(
    request: ChatRequest,
):

    message = request.message.strip()

    if not message:
        raise HTTPException(
            status_code=400,
            detail="Message cannot be empty",
        )

    # -----------------------------------------------------
    # VECTOR SEARCH
    # -----------------------------------------------------

    if not vector_store.ready:

        raise HTTPException(
            status_code=503,
            detail=(
                "PoC search index is not ready."
            ),
        )

    relevant_pocs = await vector_store.search(
        message,
        top_k=5,
    )

    # -----------------------------------------------------
    # BUILD CONTEXT
    # -----------------------------------------------------

    poc_context = build_poc_context(
        relevant_pocs
    )

    # -----------------------------------------------------
    # MESSAGES
    # -----------------------------------------------------

    messages = [
        {
            "role": "system",
            "content": SYSTEM_PROMPT,
        }
    ]

    # -----------------------------------------------------
    # LIMITED HISTORY
    #
    # Only keep the last 2 messages.
    # This reduces prompt size and latency.
    # -----------------------------------------------------

    for history_message in request.history[-2:]:

        role = history_message.get(
            "role"
        )

        content = history_message.get(
            "content"
        )

        if role not in (
            "user",
            "assistant",
        ):
            continue

        if not content:
            continue

        messages.append(
            {
                "role": role,
                "content": str(content),
            }
        )

    # -----------------------------------------------------
    # CURRENT QUESTION
    # -----------------------------------------------------

    user_prompt = f"""
AUTHORITATIVE POC RECORDS:

{poc_context}

---

USER QUESTION:

{message}

---

Answer the user's question using ONLY the
authoritative PoC records above.

If the requested information is not present
in those records, clearly say that it is
not available.

Do not invent missing information.
""".strip()

    messages.append(
        {
            "role": "user",
            "content": user_prompt,
        }
    )

    # -----------------------------------------------------
    # OLLAMA
    # -----------------------------------------------------

    try:

        async with httpx.AsyncClient(
            timeout=60
        ) as client:

            response = await client.post(
                f"{OLLAMA_URL}/api/chat",

                json={
                    "model": OLLAMA_MODEL,
                    "messages": messages,
                    "stream": False,

                    "options": {
                        "temperature": 0,
                    },
                },
            )

            response.raise_for_status()

            result = response.json()

    except httpx.TimeoutException:

        raise HTTPException(
            status_code=504,
            detail="AI response timed out.",
        )

    except httpx.HTTPError as exc:

        raise HTTPException(
            status_code=502,
            detail=(
                "Failed to communicate with "
                f"Ollama: {exc}"
            ),
        )

    # -----------------------------------------------------
    # RESPONSE
    # -----------------------------------------------------

    answer = (
        result
        .get("message", {})
        .get("content", "")
        .strip()
    )

    if not answer:

        raise HTTPException(
            status_code=502,
            detail=(
                "Ollama returned an empty response."
            ),
        )

    return {
        "response": answer,

        "model": OLLAMA_MODEL,

        "sources": [
            {
                "id": poc.get("id"),
                "title": poc.get("title"),
                "similarity": poc.get(
                    "_similarity"
                ),
            }
            for poc in relevant_pocs
        ],
    }