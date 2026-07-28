from utils.face_verification import verify_face


class FaceService:

    @staticmethod
    def verify(image1, image2):

        result = verify_face(image1, image2)

        return result