from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
import random
from .. import database, models

# Initialize the Router
router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)

# In-memory OTP storage (resets on server restart)
otp_storage = {}

# Request Models
class EmailRequest(BaseModel):
    email: str

class OTPRequest(BaseModel):
    email: str
    otp: str

# Database Dependency
def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ==========================
# 1. SEND OTP (Simulation)
# ==========================
@router.post("/send-otp")
def send_otp(request: EmailRequest):
    """
    Generates a random 4-digit OTP and prints it to the terminal.
    """
    # Generate OTP
    otp = str(random.randint(1000, 9999))
    otp_storage[request.email] = otp
    
    # PRINT TO TERMINAL (The Demo Trick)
    print(f"\n" + "="*40)
    print(f"🔐 DEMO OTP for {request.email}: {otp}")
    print(f"="*40 + "\n")
    
    return {"message": "OTP sent to terminal"}

# ==========================
# 2. VERIFY OTP & LOGIN
# ==========================
@router.post("/verify-otp")
def verify_otp(request: OTPRequest, db: Session = Depends(get_db)):
    """
    Verifies OTP and creates/retrieves the user from the database.
    """
    # Check if OTP matches
    stored_otp = otp_storage.get(request.email)
    if not stored_otp or stored_otp != request.otp:
        raise HTTPException(status_code=400, detail="Invalid OTP")
    
    # Clear OTP after success (Security)
    del otp_storage[request.email]
    
    # Check Database for User
    user = db.query(models.User).filter(models.User.email == request.email).first()
    
    if not user:
        # Create New User if they don't exist
        print(f"👤 Registering new user: {request.email}")
        user = models.User(
            email=request.email, 
            name="New User", 
            password="demo-password" # Placeholder for demo
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    
    # Return User ID (Critical for the Header-Based Logic)
    return {
        "status": "success", 
        "user_id": user.id, 
        "email": user.email,
        "name": user.name
    }