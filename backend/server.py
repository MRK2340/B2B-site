from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional, List
import os
import io
from datetime import datetime, timezone
from pymongo import MongoClient
from dotenv import load_dotenv
from reportlab.lib.pagesizes import letter
from reportlab.lib.colors import HexColor
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table as RLTable, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch

load_dotenv()

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

class PartnershipStatusUpdate(BaseModel):
    status: str

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
    data["status"] = "pending"
    result = db.partnerships.insert_one(data)
    return {"status": "success", "id": str(result.inserted_id)}

@app.get("/api/partnerships")
def get_partnerships():
    partnerships = list(db.partnerships.find({}, {"_id": 0}))
    return {"partnerships": partnerships}

@app.get("/api/admin/partnerships")
def admin_get_partnerships():
    partnerships = []
    for doc in db.partnerships.find({}).sort("created_at", -1):
        doc["id"] = str(doc["_id"])
        del doc["_id"]
        partnerships.append(doc)
    return {"partnerships": partnerships}

@app.put("/api/admin/partnerships/{partnership_id}/status")
def update_partnership_status(partnership_id: str, update: PartnershipStatusUpdate):
    from bson import ObjectId
    result = db.partnerships.update_one(
        {"_id": ObjectId(partnership_id)},
        {"$set": {"status": update.status, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    if result.modified_count == 0:
        return {"status": "error", "message": "Partnership not found"}
    return {"status": "success"}

@app.delete("/api/admin/partnerships/{partnership_id}")
def delete_partnership(partnership_id: str):
    from bson import ObjectId
    result = db.partnerships.delete_one({"_id": ObjectId(partnership_id)})
    if result.deleted_count == 0:
        return {"status": "error", "message": "Partnership not found"}
    return {"status": "success"}

@app.get("/api/admin/stats")
def admin_stats():
    total = db.partnerships.count_documents({})
    pending = db.partnerships.count_documents({"status": "pending"})
    approved = db.partnerships.count_documents({"status": "approved"})
    rejected = db.partnerships.count_documents({"status": "rejected"})

    total_value = 0
    total_officials = 0
    for p in db.partnerships.find({}, {"_id": 0, "perUserRate": 1, "numOfficials": 1, "termStructure": 1, "pilotDiscount": 1}):
        rate = float(p.get("perUserRate") or 0)
        officials = int(p.get("numOfficials") or 0)
        months = 12 if p.get("termStructure") == "annual" else 4
        discount = float(p.get("pilotDiscount") or 0)
        total_value += rate * officials * months * (1 - discount / 100)
        total_officials += officials

    return {
        "total": total,
        "pending": pending,
        "approved": approved,
        "rejected": rejected,
        "total_value": round(total_value, 2),
        "total_officials": total_officials,
    }

@app.post("/api/partnerships/{partnership_id}/pdf")
def generate_partnership_pdf(partnership_id: str):
    from bson import ObjectId
    doc = db.partnerships.find_one({"_id": ObjectId(partnership_id)})
    if not doc:
        return {"status": "error", "message": "Partnership not found"}

    buffer = io.BytesIO()
    pdf = SimpleDocTemplate(buffer, pagesize=letter, topMargin=0.5*inch, bottomMargin=0.5*inch)

    styles = getSampleStyleSheet()
    blue = HexColor('#003D7A')
    light_blue = HexColor('#0080C8')

    title_style = ParagraphStyle('Title', parent=styles['Title'], textColor=blue, fontSize=18, spaceAfter=6)
    heading_style = ParagraphStyle('Heading', parent=styles['Heading2'], textColor=blue, fontSize=13, spaceBefore=12, spaceAfter=6)
    normal_style = ParagraphStyle('Normal', parent=styles['Normal'], fontSize=10, spaceAfter=4)

    elements = []
    elements.append(Paragraph("iWhistle", title_style))
    elements.append(Paragraph("INSTITUTIONAL PARTNERSHIP AGREEMENT", ParagraphStyle('Sub', parent=styles['Normal'], textColor=light_blue, fontSize=11, spaceAfter=12)))
    elements.append(Paragraph(f"Effective Date: {doc.get('signatureDate', '[Date]')}", normal_style))
    elements.append(Spacer(1, 12))

    def add_section(title, rows):
        elements.append(Paragraph(title, heading_style))
        for label, value in rows:
            elements.append(Paragraph(f"<b>{label}:</b> {value or '[Not provided]'}", normal_style))

    add_section("PARTIES", [
        ("Provider", "iWhistle, LLC"),
        ("Partner", doc.get("partnerOrgName", "")),
        ("Entity Type", doc.get("partnerEntityType", "")),
        ("State", doc.get("partnerState", "")),
        ("Address", f"{doc.get('partnerAddress','')}, {doc.get('partnerCity','')}, {doc.get('partnerState','')} {doc.get('partnerZip','')}"),
    ])

    term = "Annual (12 months)" if doc.get("termStructure") == "annual" else "Seasonal (3-6 months)"
    add_section("PROGRAM DETAILS", [
        ("Organization Type", doc.get("orgType", "")),
        ("Term Structure", term),
        ("Subscription Period", f"{doc.get('startDate','')} to {doc.get('endDate','')}"),
        ("Authorized Users", doc.get("numOfficials", "")),
    ])

    rate = float(doc.get("perUserRate") or 0)
    officials = int(doc.get("numOfficials") or 0)
    months = 12 if doc.get("termStructure") == "annual" else 4
    discount = float(doc.get("pilotDiscount") or 0)
    total = rate * officials * months * (1 - discount / 100)

    add_section("PRICING", [
        ("Per-User Monthly Rate", f"${doc.get('perUserRate', '[Rate]')}"),
        ("Pilot Discount", f"{doc.get('pilotDiscount', '0')}%"),
        ("Total Agreement Value", f"${total:.2f}"),
    ])

    add_section("PARTNER CHAMPION", [
        ("Name", doc.get("championName", "")),
        ("Title", doc.get("championTitle", "")),
        ("Email", doc.get("championEmail", "")),
        ("Phone", doc.get("championPhone", "")),
    ])

    add_section("PRIMARY CONTACT", [
        ("Name", doc.get("contactName", "")),
        ("Title", doc.get("contactTitle", "")),
        ("Email", doc.get("contactEmail", "")),
        ("Phone", doc.get("contactPhone", "")),
    ])

    add_section("AUTHORIZED SIGNATORY", [
        ("Name", doc.get("signerName", "")),
        ("Title", doc.get("signerTitle", "")),
        ("Date", doc.get("signatureDate", "")),
    ])

    elements.append(Spacer(1, 30))
    elements.append(Paragraph("This agreement is subject to iWhistle's standard Institutional Partnership Agreement terms.", ParagraphStyle('Footer', parent=styles['Normal'], fontSize=8, textColor=HexColor('#999999'))))

    pdf.build(elements)
    buffer.seek(0)

    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=iWhistle-Agreement-{doc.get('partnerOrgName','Draft')}.pdf"}
    )
