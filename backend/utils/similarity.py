"""Username and biography similarity helpers.

The embedding model is optional at runtime.  Loading it at module import time
made the whole API fail to start whenever the Hugging Face model had not
already been cached locally (for example, while offline).
"""

import logging
from functools import lru_cache

from rapidfuzz import fuzz


logger = logging.getLogger(__name__)
MODEL_NAME = "all-MiniLM-L6-v2"


def username_similarity(username1: str, username2: str):

    score = fuzz.ratio(username1.lower(), username2.lower())

    return round(score, 2)


@lru_cache(maxsize=1)
def _get_embedding_model():
    """Return a cached local embedding model, or ``None`` when unavailable.

    ``local_files_only`` deliberately prevents request-time network retries.
    Download the model once on a connected machine to enable semantic matching;
    the API will otherwise use the deterministic lexical fallback below.
    """
    try:
        from sentence_transformers import SentenceTransformer

        return SentenceTransformer(MODEL_NAME, local_files_only=True)
    except Exception as exc:  # Model cache may be absent or incomplete.
        logger.warning(
            "Local sentence-transformer model is unavailable; using lexical "
            "bio similarity instead. Details: %s",
            exc,
        )
        return None


def bio_similarity(bio1: str, bio2: str):
    """Return similarity as a percentage without requiring internet access."""
    model = _get_embedding_model()

    if model is not None:
        embeddings = model.encode([bio1, bio2], normalize_embeddings=True)
        # Normalized vectors have a cosine similarity equal to their dot product.
        score = float(embeddings[0] @ embeddings[1])
        return round(max(0.0, min(1.0, score)) * 100, 2)

    # token_set_ratio handles reordered words while ratio retains character-level
    # similarity; using the stronger result gives a useful offline baseline.
    score = max(
        fuzz.ratio(bio1.lower(), bio2.lower()),
        fuzz.token_set_ratio(bio1.lower(), bio2.lower()),
    )
    return round(score, 2)
