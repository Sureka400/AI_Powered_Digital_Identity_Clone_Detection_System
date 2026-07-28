from pydantic import BaseModel


class ProfileRequest(BaseModel):
    profile_pic: int
    username_length: float
    fullname_words: int
    fullname_length: int
    name_equals_username: int
    description_length: int
    external_url: int
    private: int
    posts: int
    followers: int
    following: int


class ProfileResponse(BaseModel):
    prediction: int
    result: str