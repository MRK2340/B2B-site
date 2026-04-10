from fastapi import APIRouter, Depends
from datetime import datetime, timezone
from bson import ObjectId
from models import PartnershipStatusUpdate, ContactReply
from database import db
from utils.auth import require_admin

router = APIRouter(prefix="/api/admin", tags=["admin"])


@router.get("/partnerships")
def admin_get_partnerships(user: dict = Depends(require_admin)):
    partnerships = []
    for doc in db.partnerships.find({}).sort("created_at", -1):
        doc["id"] = str(doc["_id"])
        del doc["_id"]
        partnerships.append(doc)
    return {"partnerships": partnerships}


@router.put("/partnerships/{partnership_id}/status")
def update_partnership_status(
    partnership_id: str,
    update: PartnershipStatusUpdate,
    user: dict = Depends(require_admin),
):
    result = db.partnerships.update_one(
        {"_id": ObjectId(partnership_id)},
        {"$set": {"status": update.status, "updated_at": datetime.now(timezone.utc).isoformat()}},
    )
    if result.modified_count == 0:
        return {"status": "error", "message": "Partnership not found"}
    return {"status": "success"}


@router.delete("/partnerships/{partnership_id}")
def delete_partnership(partnership_id: str, user: dict = Depends(require_admin)):
    result = db.partnerships.delete_one({"_id": ObjectId(partnership_id)})
    if result.deleted_count == 0:
        return {"status": "error", "message": "Partnership not found"}
    return {"status": "success"}


@router.get("/stats")
def admin_stats(user: dict = Depends(require_admin)):
    total = db.partnerships.count_documents({})
    pending = db.partnerships.count_documents({"status": "pending"})
    approved = db.partnerships.count_documents({"status": "approved"})
    rejected = db.partnerships.count_documents({"status": "rejected"})

    total_value = 0
    total_officials = 0
    for p in db.partnerships.find(
        {}, {"_id": 0, "perUserRate": 1, "numOfficials": 1, "termStructure": 1, "pilotDiscount": 1}
    ):
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


@router.get("/contact")
def admin_get_contact(user: dict = Depends(require_admin)):
    inquiries = []
    for doc in db.contact_inquiries.find({}).sort("created_at", -1):
        doc["id"] = str(doc["_id"])
        del doc["_id"]
        inquiries.append(doc)
    return {"inquiries": inquiries}


@router.put("/contact/{inquiry_id}/read")
def mark_contact_read(inquiry_id: str, user: dict = Depends(require_admin)):
    db.contact_inquiries.update_one(
        {"_id": ObjectId(inquiry_id)},
        {"$set": {"status": "read"}},
    )
    return {"status": "success"}


@router.post("/contact/{inquiry_id}/reply")
def reply_to_contact(inquiry_id: str, reply: ContactReply, user: dict = Depends(require_admin)):
    db.contact_inquiries.update_one(
        {"_id": ObjectId(inquiry_id)},
        {"$set": {
            "status": "replied",
            "reply_text": reply.reply_text,
            "replied_at": datetime.now(timezone.utc).isoformat(),
            "replied_by": user["email"],
        }},
    )
    return {"status": "success"}


@router.get("/users")
def admin_get_users(user: dict = Depends(require_admin)):
    users = []
    for doc in db.users.find({"role": "partner"}).sort("created_at", -1):
        email = doc.get("email", "")
        app_count = db.partnerships.count_documents({"submitted_by": email})
        users.append({
            "name": doc.get("name", ""),
            "email": email,
            "organization": doc.get("organization", ""),
            "created_at": doc.get("created_at", ""),
            "app_count": app_count,
        })
    return {"users": users}
