# c:\AI\repos\real-estate-intelligence\backend\services\real-intelligence-system\main.py
from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def read_root():
    return {"service": "real-intelligence-system"}
