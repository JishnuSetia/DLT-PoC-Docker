import json
import math
import re

import httpx

from ..cache.redis import redis_client


# =========================================================
# CONFIG
# =========================================================

REDIS_KEY = "deliverables:all"

OLLAMA_URL = "http://ollama:11434"
EMBEDDING_MODEL = "nomic-embed-text"

DEFAULT_TOP_K = 5

# Minimum semantic similarity required for a result
MIN_SIMILARITY = 0.30


# =========================================================
# VECTOR STORE
# =========================================================

class PoCVectorStore:

    def __init__(self):
        self.documents: list[dict] = []
        self.embeddings: list[list[float]] = []

        self.ready = False

        # Reuse ONE HTTP client instead of creating one
        # for every embedding request.
        self.http_client: httpx.AsyncClient | None = None

    # =====================================================
    # HTTP CLIENT
    # =====================================================

    async def start(self):
        if self.http_client is None:
            self.http_client = httpx.AsyncClient(
                timeout=60
            )

    async def close(self):
        if self.http_client:
            await self.http_client.aclose()
            self.http_client = None

    # =====================================================
    # BUILD SEARCH TEXT
    # =====================================================

    @staticmethod
    def build_search_text(poc: dict) -> str:

        fields = [
            poc.get("title"),
            poc.get("description"),
            poc.get("technology"),
            poc.get("technologyAr"),
            poc.get("department"),
            poc.get("departmentAr"),
            poc.get("benefits"),
            poc.get("code"),
        ]

        return " ".join(
            str(value).strip()
            for value in fields
            if value
        )

    # =====================================================
    # NORMALIZE
    # =====================================================

    @staticmethod
    def normalize(value) -> str:
        return str(value or "").strip().lower()

    # =====================================================
    # TOKENIZE
    # =====================================================

    @staticmethod
    def tokenize(value: str) -> set[str]:

        return set(
            re.findall(
                r"[a-z0-9]+",
                value.lower()
            )
        )

    # =====================================================
    # EMBEDDING
    # =====================================================

    async def create_embedding(
        self,
        text: str,
    ) -> list[float]:

        if not self.http_client:
            await self.start()

        response = await self.http_client.post(
            f"{OLLAMA_URL}/api/embeddings",
            json={
                "model": EMBEDDING_MODEL,
                "prompt": text,
            },
        )

        response.raise_for_status()

        data = response.json()

        embedding = data.get("embedding")

        if not embedding:
            raise RuntimeError(
                "Ollama returned no embedding."
            )

        return embedding

    # =====================================================
    # LOAD REDIS DATA
    # =====================================================

    async def load_documents(self) -> bool:

        cached_data = await redis_client.get(
            REDIS_KEY
        )

        if not cached_data:
            print(
                "Vector store: Redis cache "
                "deliverables:all does not exist."
            )

            return False

        try:
            data = json.loads(cached_data)

        except json.JSONDecodeError:
            print(
                "Vector store: invalid Redis JSON."
            )

            return False

        documents = data.get(
            "items",
            []
        )

        if not documents:
            print(
                "Vector store: Redis contains "
                "no PoCs."
            )

            return False

        self.documents = documents

        return True

    # =====================================================
    # BUILD INDEX
    # =====================================================

    async def build_index(self):

        if not self.documents:
            self.ready = False
            return

        print(
            f"Creating embeddings for "
            f"{len(self.documents)} PoCs..."
        )

        new_embeddings = []

        for index, poc in enumerate(
            self.documents,
            start=1,
        ):

            text = self.build_search_text(
                poc
            )

            embedding = await self.create_embedding(
                text
            )

            new_embeddings.append(
                embedding
            )

            print(
                f"Embedded PoC "
                f"{index}/{len(self.documents)}"
            )

        self.embeddings = new_embeddings

        self.ready = True

        print(
            "PoC vector store ready."
        )

    # =====================================================
    # INITIALIZE
    # =====================================================

    async def initialize(self):

        print(
            "Initializing PoC vector store..."
        )

        await self.start()

        loaded = await self.load_documents()

        if not loaded:
            self.ready = False
            return

        await self.build_index()

    # =====================================================
    # REFRESH
    # =====================================================

    async def refresh(self):

        print(
            "Refreshing PoC vector store..."
        )

        self.ready = False

        loaded = await self.load_documents()

        if not loaded:

            self.documents = []
            self.embeddings = []

            return

        await self.build_index()

    # =====================================================
    # COSINE SIMILARITY
    # =====================================================

    @staticmethod
    def cosine_similarity(
        a: list[float],
        b: list[float],
    ) -> float:

        dot_product = sum(
            x * y
            for x, y in zip(a, b)
        )

        magnitude_a = math.sqrt(
            sum(
                x * x
                for x in a
            )
        )

        magnitude_b = math.sqrt(
            sum(
                x * x
                for x in b
            )
        )

        if (
            magnitude_a == 0
            or magnitude_b == 0
        ):
            return 0.0

        return (
            dot_product
            / (
                magnitude_a
                * magnitude_b
            )
        )

    # =====================================================
    # KEYWORD SCORE
    # =====================================================

    def keyword_score(
        self,
        query: str,
        poc: dict,
    ) -> float:

        query_tokens = self.tokenize(
            query
        )

        if not query_tokens:
            return 0.0

        title = self.normalize(
            poc.get("title")
        )

        description = self.normalize(
            poc.get("description")
        )

        technology = self.normalize(
            poc.get("technology")
        )

        department = self.normalize(
            poc.get("department")
        )

        benefits = self.normalize(
            poc.get("benefits")
        )

        code = self.normalize(
            poc.get("code")
        )

        # Title gets the strongest weight.
        title_tokens = self.tokenize(title)

        description_tokens = self.tokenize(
            description
        )

        technology_tokens = self.tokenize(
            technology
        )

        department_tokens = self.tokenize(
            department
        )

        benefits_tokens = self.tokenize(
            benefits
        )

        code_tokens = self.tokenize(
            code
        )

        score = 0.0

        for token in query_tokens:

            if token in title_tokens:
                score += 1.0

            elif token in technology_tokens:
                score += 0.9

            elif token in department_tokens:
                score += 0.8

            elif token in code_tokens:
                score += 0.8

            elif token in description_tokens:
                score += 0.5

            elif token in benefits_tokens:
                score += 0.3

        # Normalize approximately by number of query tokens.
        return score / max(
            len(query_tokens),
            1,
        )

    # =====================================================
    # EXACT FIELD MATCH
    # =====================================================

    def exact_match(
        self,
        query: str,
        poc: dict,
    ) -> bool:

        query = self.normalize(query)

        fields = [
            poc.get("title"),
            poc.get("technology"),
            poc.get("technologyAr"),
            poc.get("department"),
            poc.get("departmentAr"),
            poc.get("code"),
        ]

        for field in fields:

            value = self.normalize(field)

            if value and value in query:
                return True

        return False

    # =====================================================
    # SEARCH
    # =====================================================

    async def search(
        self,
        query: str,
        top_k: int = DEFAULT_TOP_K,
    ) -> list[dict]:

        if not self.ready:
            return []

        if not query.strip():
            return []

        # -------------------------------------------------
        # EXACT / KEYWORD PASS
        # -------------------------------------------------

        keyword_results = []

        for index, poc in enumerate(
            self.documents
        ):

            keyword = self.keyword_score(
                query,
                poc,
            )

            exact = self.exact_match(
                query,
                poc,
            )

            if exact:
                keyword += 2.0

            if keyword > 0:

                keyword_results.append(
                    (
                        keyword,
                        index,
                    )
                )

        keyword_results.sort(
            key=lambda item: item[0],
            reverse=True,
        )

        # -------------------------------------------------
        # EMBEDDING SEARCH
        # -------------------------------------------------

        query_embedding = (
            await self.create_embedding(
                query
            )
        )

        semantic_results = []

        for index, embedding in enumerate(
            self.embeddings
        ):

            similarity = (
                self.cosine_similarity(
                    query_embedding,
                    embedding,
                )
            )

            semantic_results.append(
                (
                    similarity,
                    index,
                )
            )

        semantic_results.sort(
            key=lambda item: item[0],
            reverse=True,
        )

        # -------------------------------------------------
        # HYBRID RANKING
        # -------------------------------------------------

        combined = {}

        for keyword, index in keyword_results:

            combined[index] = (
                combined.get(index, 0)
                + keyword * 0.60
            )

        for similarity, index in semantic_results:

            combined[index] = (
                combined.get(index, 0)
                + similarity * 0.40
            )

        ranked = sorted(
            combined.items(),
            key=lambda item: item[1],
            reverse=True,
        )

        results = []

        for index, score in ranked[:top_k]:

            poc = dict(
                self.documents[index]
            )

            semantic_similarity = (
                dict(semantic_results)
                .get(index, 0.0)
            )

            poc["_similarity"] = round(
                semantic_similarity,
                4,
            )

            poc["_score"] = round(
                score,
                4,
            )

            results.append(poc)

        return results


# =========================================================
# GLOBAL VECTOR STORE
# =========================================================

vector_store = PoCVectorStore()