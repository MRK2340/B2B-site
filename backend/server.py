from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import Optional
import os
import io
from datetime import datetime, timezone, timedelta
from pymongo import MongoClient
from dotenv import load_dotenv
from jose import JWTError, jwt
from passlib.context import CryptContext
from reportlab.lib.pagesizes import letter
from reportlab.lib.colors import HexColor
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
import resend

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
SECRET_KEY = os.environ.get("SECRET_KEY")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_HOURS = 24
RESEND_API_KEY = os.environ.get("RESEND_API_KEY")
SENDER_EMAIL = os.environ.get("SENDER_EMAIL")
ADMIN_NOTIFICATION_EMAIL = os.environ.get("ADMIN_NOTIFICATION_EMAIL")

client = MongoClient(MONGO_URL)
db = client[DB_NAME]

if RESEND_API_KEY:
    resend.api_key = RESEND_API_KEY

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()
security_optional = HTTPBearer(auto_error=False)


# ─── Pydantic Models ──────────────────────────────────────────────────────────

class UserRegister(BaseModel):
    name: str
    organization: str
    email: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

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
    signature: Optional[str] = ""

class PartnershipStatusUpdate(BaseModel):
    status: str


# ─── Auth Utilities ───────────────────────────────────────────────────────────

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)

def create_token(data: dict) -> str:
    expire = datetime.now(timezone.utc) + timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS)
    return jwt.encode({**data, "exp": expire}, SECRET_KEY, algorithm=ALGORITHM)

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("sub")
        if not email:
            raise HTTPException(status_code=401, detail="Invalid token")
        user = db.users.find_one({"email": email}, {"_id": 0, "password_hash": 0})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

def require_admin(user: dict = Depends(get_current_user)):
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return user


# ─── Seed Admin User ──────────────────────────────────────────────────────────

def seed_admin():
    existing = db.users.find_one({"email": "admin@i-whistle.com"})
    if not existing:
        db.users.insert_one({
            "name": "Admin",
            "organization": "iWhistle",
            "email": "admin@i-whistle.com",
            "password_hash": hash_password("admin123"),
            "role": "admin",
            "created_at": datetime.now(timezone.utc).isoformat(),
        })

seed_admin()


# ─── DB Indexes ───────────────────────────────────────────────────────────────

def create_indexes():
    db.users.create_index("email", unique=True, background=True)
    db.partnerships.create_index("submitted_by", background=True)
    db.partnerships.create_index("status", background=True)
    db.partnerships.create_index("created_at", background=True)
    db.partnerships.create_index([("submitted_by", 1), ("created_at", -1)], background=True)

create_indexes()


# ─── Email Helper ─────────────────────────────────────────────────────────────

def send_new_application_email(data: dict):
    if not RESEND_API_KEY:
        return
    try:
        html = f"""
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #003D7A, #0080C8); padding: 24px; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 22px;">iWhistle</h1>
            <p style="color: rgba(255,255,255,0.8); margin: 4px 0 0 0; font-size: 14px;">New Partnership Application</p>
          </div>
          <div style="background: #f9fafb; padding: 24px; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb;">
            <h2 style="color: #003D7A; font-size: 18px;">Application Details</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 6px 0; color: #6b7280; font-size: 14px;">Organization:</td><td style="padding: 6px 0; font-weight: 600; font-size: 14px;">{data.get('partnerOrgName', 'N/A')}</td></tr>
              <tr><td style="padding: 6px 0; color: #6b7280; font-size: 14px;">Contact:</td><td style="padding: 6px 0; font-size: 14px;">{data.get('contactName', 'N/A')}</td></tr>
              <tr><td style="padding: 6px 0; color: #6b7280; font-size: 14px;">Email:</td><td style="padding: 6px 0; font-size: 14px;">{data.get('contactEmail', 'N/A')}</td></tr>
              <tr><td style="padding: 6px 0; color: #6b7280; font-size: 14px;">Submitted:</td><td style="padding: 6px 0; font-size: 14px;">{data.get('created_at', 'N/A')}</td></tr>
            </table>
            <div style="margin-top: 24px; padding: 16px; background: white; border-radius: 6px; border-left: 4px solid #0080C8;">
              <p style="margin: 0; color: #374151; font-size: 14px;">Login to the <strong>Admin Dashboard</strong> to review and manage this application.</p>
            </div>
          </div>
        </div>
        """
        params = {
            "from": SENDER_EMAIL,
            "to": [ADMIN_NOTIFICATION_EMAIL],
            "subject": f"New Partnership Application: {data.get('partnerOrgName', 'Unknown')}",
            "html": html,
        }
        resend.Emails.send(params)
    except Exception as e:
        print(f"Email notification failed: {e}")


# ─── Health & Root ────────────────────────────────────────────────────────────

@app.get("/")
def read_root():
    return {"message": "iWhistle B2B Partnership Portal Backend"}

@app.get("/api/health")
def health_check():
    return {"status": "healthy"}


# ─── Auth Endpoints ───────────────────────────────────────────────────────────

@app.post("/api/auth/register")
def register(user_data: UserRegister):
    if db.users.find_one({"email": user_data.email}):
        raise HTTPException(status_code=400, detail="Email already registered")
    db.users.insert_one({
        "name": user_data.name,
        "organization": user_data.organization,
        "email": user_data.email,
        "password_hash": hash_password(user_data.password),
        "role": "partner",
        "created_at": datetime.now(timezone.utc).isoformat(),
    })
    token = create_token({"sub": user_data.email})
    return {
        "token": token,
        "user": {"email": user_data.email, "name": user_data.name, "role": "partner", "organization": user_data.organization},
    }

@app.post("/api/auth/login")
def login(credentials: UserLogin):
    user = db.users.find_one({"email": credentials.email})
    if not user or not verify_password(credentials.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = create_token({"sub": user["email"]})
    return {
        "token": token,
        "user": {
            "email": user["email"],
            "name": user["name"],
            "role": user["role"],
            "organization": user.get("organization", ""),
        },
    }

@app.get("/api/auth/me")
def get_me(user: dict = Depends(get_current_user)):
    return {"user": user}


# ─── Partnership Endpoints ────────────────────────────────────────────────────

@app.post("/api/partnerships")
def submit_partnership(form_data: PartnershipFormData, user: dict = Depends(get_current_user)):
    data = form_data.dict()
    data["created_at"] = datetime.now(timezone.utc).isoformat()
    data["status"] = "pending"
    data["submitted_by"] = user["email"]
    result = db.partnerships.insert_one(data)
    send_new_application_email(data)
    return {"status": "success", "id": str(result.inserted_id)}

@app.get("/api/partnerships")
def get_partnerships(user: dict = Depends(get_current_user)):
    partnerships = []
    for doc in db.partnerships.find({"submitted_by": user["email"]}).sort("created_at", -1):
        doc["id"] = str(doc["_id"])
        del doc["_id"]
        partnerships.append(doc)
    return {"partnerships": partnerships}

@app.get("/api/admin/partnerships")
def admin_get_partnerships(
    user: dict = Depends(require_admin),
    page: int = 1,
    per_page: int = 50,
):
    page = max(1, page)
    per_page = max(1, min(per_page, 200))
    skip = (page - 1) * per_page
    total = db.partnerships.count_documents({})
    partnerships = []
    for doc in db.partnerships.find({}).sort("created_at", -1).skip(skip).limit(per_page):
        doc["id"] = str(doc["_id"])
        del doc["_id"]
        partnerships.append(doc)
    return {
        "partnerships": partnerships,
        "total": total,
        "page": page,
        "per_page": per_page,
        "pages": (total + per_page - 1) // per_page,
    }

@app.put("/api/admin/partnerships/{partnership_id}/status")
def update_partnership_status(partnership_id: str, update: PartnershipStatusUpdate, user: dict = Depends(require_admin)):
    from bson import ObjectId
    result = db.partnerships.update_one(
        {"_id": ObjectId(partnership_id)},
        {"$set": {"status": update.status, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    if result.modified_count == 0:
        return {"status": "error", "message": "Partnership not found"}
    return {"status": "success"}

@app.delete("/api/admin/partnerships/{partnership_id}")
def delete_partnership(partnership_id: str, user: dict = Depends(require_admin)):
    from bson import ObjectId
    result = db.partnerships.delete_one({"_id": ObjectId(partnership_id)})
    if result.deleted_count == 0:
        return {"status": "error", "message": "Partnership not found"}
    return {"status": "success"}

@app.get("/api/admin/stats")
def admin_stats(user: dict = Depends(require_admin)):
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
def generate_partnership_pdf(partnership_id: str, user: dict = Depends(get_current_user)):
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
