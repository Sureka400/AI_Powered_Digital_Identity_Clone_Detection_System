from utils.similarity import bio_similarity


class BioService:

    @staticmethod
    def compare(bio1, bio2):

        similarity = bio_similarity(bio1, bio2)

        return {
            "bio_similarity": similarity,
            "match": similarity >= 80
        }