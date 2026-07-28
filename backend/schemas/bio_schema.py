from pydantic import BaseModel

class BioRequest(BaseModel):
    bio1: str
    bio2: str

@app.post("/bio/similarity")
def similarity(request: BioRequest):
    return {
        "similarity": calculate_similarity(request.bio1, request.bio2)
    }