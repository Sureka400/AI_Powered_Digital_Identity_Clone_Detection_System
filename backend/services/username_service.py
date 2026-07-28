from utils.similarity import username_similarity


class UsernameService:

    @staticmethod
    def compare(username1, username2):

        similarity = username_similarity(username1, username2)

        return {
            "username_similarity": similarity,
            "match": similarity >= 80
        }