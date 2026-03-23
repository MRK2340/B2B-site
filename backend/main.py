from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.auth import router as auth_router
from routes.partners import router as partners_router
from routes.admin import router as admin_router
from utils.auth import seed_admin

app = FastAPI(title="iWhistle B2B Partnership Portal")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(partners_router)
app.include_router(admin_router)


@app.get("/")
def read_root():
    return {"message": "iWhistle B2B Partnership Portal Backend"}


@app.get("/api/health")
def health_check():
    return {"status": "healthy"}


seed_admin()
