from fastapi import APIRouter, HTTPException, Depends
from datetime import datetime, timezone
from models import UserRegister, UserLogin
from database import db
from utils.auth import hash_password, verify_password, create_token, get_current_user

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/register")
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
        "user": {
            "email": user_data.email,
            "name": user_data.name,
            "role": "partner",
            "organization": user_data.organization,
        },
    }


@router.post("/login")
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


@router.get("/me")
def get_me(user: dict = Depends(get_current_user)):
    return {"user": user}
