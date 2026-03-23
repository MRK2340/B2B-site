import io
from fastapi import APIRouter, Depends, Request
from fastapi.responses import StreamingResponse
from datetime import datetime, timezone
from bson import ObjectId
from reportlab.lib.pagesizes import letter
from reportlab.lib.colors import HexColor
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from models import PartnershipFormData
from database import db
from utils.auth import get_current_user
from utils.email import send_new_application_email

router = APIRouter(tags=["partnerships"])


@router.post("/api/partnerships")
def submit_partnership(
    form_data: PartnershipFormData,
    request: Request,
    user: dict = Depends(get_current_user),
):
    data = form_data.dict()
    data["created_at"] = datetime.now(timezone.utc).isoformat()
    data["status"] = "pending"
    data["submitted_by"] = user["email"]

    forwarded_for = request.headers.get("X-Forwarded-For", "")
    ip_address = (
        forwarded_for.split(",")[0].strip()
        if forwarded_for
        else (request.client.host if request.client else "unknown")
    )
    data["signature_metadata"] = {
        "signed_at": datetime.now(timezone.utc).isoformat(),
        "ip_address": ip_address,
        "user_agent": request.headers.get("User-Agent", "unknown"),
    }

    result = db.partnerships.insert_one(data)
    send_new_application_email(data)
    return {"status": "success", "id": str(result.inserted_id)}


@router.get("/api/partnerships")
def get_partnerships(user: dict = Depends(get_current_user)):
    partnerships = []
    for doc in db.partnerships.find({"submitted_by": user["email"]}).sort("created_at", -1):
        doc["id"] = str(doc["_id"])
        del doc["_id"]
        partnerships.append(doc)
    return {"partnerships": partnerships}


@router.post("/api/partnerships/{partnership_id}/pdf")
def generate_partnership_pdf(partnership_id: str, user: dict = Depends(get_current_user)):
    doc = db.partnerships.find_one({"_id": ObjectId(partnership_id)})
    if not doc:
        return {"status": "error", "message": "Partnership not found"}

    buffer = io.BytesIO()
    pdf = SimpleDocTemplate(buffer, pagesize=letter, topMargin=0.5 * inch, bottomMargin=0.5 * inch)

    styles = getSampleStyleSheet()
    blue = HexColor("#003D7A")
    light_blue = HexColor("#0080C8")

    title_style = ParagraphStyle("Title", parent=styles["Title"], textColor=blue, fontSize=18, spaceAfter=6)
    heading_style = ParagraphStyle(
        "Heading", parent=styles["Heading2"], textColor=blue, fontSize=13, spaceBefore=12, spaceAfter=6
    )
    normal_style = ParagraphStyle("Normal", parent=styles["Normal"], fontSize=10, spaceAfter=4)

    elements = []
    elements.append(Paragraph("iWhistle", title_style))
    elements.append(
        Paragraph(
            "INSTITUTIONAL PARTNERSHIP AGREEMENT",
            ParagraphStyle("Sub", parent=styles["Normal"], textColor=light_blue, fontSize=11, spaceAfter=12),
        )
    )
    elements.append(Paragraph(f"Effective Date: {doc.get('signatureDate', '[Date]')}", normal_style))
    elements.append(Spacer(1, 12))

    def add_section(title, rows):
        elements.append(Paragraph(title, heading_style))
        for label, value in rows:
            elements.append(Paragraph(f"<b>{label}:</b> {value or '[Not provided]'}", normal_style))

    add_section(
        "PARTIES",
        [
            ("Provider", "iWhistle, LLC"),
            ("Partner", doc.get("partnerOrgName", "")),
            ("Entity Type", doc.get("partnerEntityType", "")),
            ("State", doc.get("partnerState", "")),
            (
                "Address",
                f"{doc.get('partnerAddress','')}, {doc.get('partnerCity','')}, {doc.get('partnerState','')} {doc.get('partnerZip','')}",
            ),
        ],
    )

    term = "Annual (12 months)" if doc.get("termStructure") == "annual" else "Seasonal (3-6 months)"
    add_section(
        "PROGRAM DETAILS",
        [
            ("Organization Type", doc.get("orgType", "")),
            ("Term Structure", term),
            ("Subscription Period", f"{doc.get('startDate','')} to {doc.get('endDate','')}"),
            ("Authorized Users", doc.get("numOfficials", "")),
        ],
    )

    rate = float(doc.get("perUserRate") or 0)
    officials = int(doc.get("numOfficials") or 0)
    months = 12 if doc.get("termStructure") == "annual" else 4
    discount = float(doc.get("pilotDiscount") or 0)
    total = rate * officials * months * (1 - discount / 100)

    add_section(
        "PRICING",
        [
            ("Per-User Monthly Rate", f"${doc.get('perUserRate', '[Rate]')}"),
            ("Pilot Discount", f"{doc.get('pilotDiscount', '0')}%"),
            ("Total Agreement Value", f"${total:.2f}"),
        ],
    )

    add_section(
        "PARTNER CHAMPION",
        [
            ("Name", doc.get("championName", "")),
            ("Title", doc.get("championTitle", "")),
            ("Email", doc.get("championEmail", "")),
            ("Phone", doc.get("championPhone", "")),
        ],
    )

    add_section(
        "PRIMARY CONTACT",
        [
            ("Name", doc.get("contactName", "")),
            ("Title", doc.get("contactTitle", "")),
            ("Email", doc.get("contactEmail", "")),
            ("Phone", doc.get("contactPhone", "")),
        ],
    )

    add_section(
        "AUTHORIZED SIGNATORY",
        [
            ("Name", doc.get("signerName", "")),
            ("Title", doc.get("signerTitle", "")),
            ("Date", doc.get("signatureDate", "")),
        ],
    )

    elements.append(Spacer(1, 30))
    elements.append(
        Paragraph(
            "This agreement is subject to iWhistle's standard Institutional Partnership Agreement terms.",
            ParagraphStyle("Footer", parent=styles["Normal"], fontSize=8, textColor=HexColor("#999999")),
        )
    )

    pdf.build(elements)
    buffer.seek(0)

    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename=iWhistle-Agreement-{doc.get('partnerOrgName','Draft')}.pdf"
        },
    )
