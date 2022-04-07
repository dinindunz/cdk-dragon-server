from fastapi import FastAPI

app = FastAPI(title="ikeGps Docker")

@app.get("/")
def get_message():
    return {"message": "ikeGps Dragon Server Docker Demo!"}