from rapidfuzz import fuzz

from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity

model = SentenceTransformer("all-MiniLM-L6-v2")


def username_similarity(username1: str, username2: str):

    score = fuzz.ratio(username1.lower(), username2.lower())

    return round(score, 2)


def bio_similarity(bio1: str, bio2: str):

    emb1 = model.encode([bio1])

    emb2 = model.encode([bio2])

    score = cosine_similarity(emb1, emb2)[0][0]

    return round(score * 100, 2)