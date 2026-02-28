from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import os
from datetime import datetime, timezone
from pymongo import MongoClient

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MONGO_URL = os.environ.get("MONGO_URL")
DB_NAME = os.environ.get("DB_NAME")
client = MongoClient(MONGO_URL)
db = client[DB_NAME]

class PartnershipFormData(BaseModel):
    partnerOrgName: str
    partnerEntityType: Optional[str] = ""
    partnerState: Optional[str] = ""
    partnerAddress: Optional[str] = ""
    partnerCity: Optional[str] = ""
    partnerZip: Optional[str] = ""
    contactName: str
    contactTitle: Optional[str] = ""
    contactEmail: str
    contactPhone: Optional[str] = ""
    termStructure: Optional[str] = "annual"
    startDate: Optional[str] = ""
    endDate: Optional[str] = ""
    numOfficials: Optional[str] = ""
    orgType: Optional[str] = ""
    championName: Optional[str] = ""
    championTitle: Optional[str] = ""
    championEmail: Optional[str] = ""
    championPhone: Optional[str] = ""
    signerName: Optional[str] = ""
    signerTitle: Optional[str] = ""
    signatureDate: Optional[str] = ""
    perUserRate: Optional[str] = ""
    pilotDiscount: Optional[str] = ""

@app.get("/")
def read_root():
    return {"message": "iWhistle B2B Partnership Portal Backend"}

@app.get("/api/health")
def health_check():
    return {"status": "healthy"}

@app.post("/api/partnerships")
def submit_partnership(form_data: PartnershipFormData):
    data = form_data.dict()
    data["created_at"] = datetime.now(timezone.utc).isoformat()
    result = db.partnerships.insert_one(data)
    return {"status": "success", "id": str(result.inserted_id)}

@app.get("/api/partnerships")
def get_partnerships():
    partnerships = list(db.partnerships.find({}, {"_id": 0}))
    return {"partnerships": partnerships}
