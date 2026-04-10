from pydantic import BaseModel
from typing import Optional


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


class ContactInquiry(BaseModel):
    category: Optional[str] = "general"
    subject: str
    message: str


class ContactReply(BaseModel):
    reply_text: str
