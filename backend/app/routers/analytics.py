from fastapi import APIRouter, Depends, Header
from sqlalchemy.orm import Session
from .. import models, database

router = APIRouter(prefix="/analytics", tags=["Analytics"])

def get_db():
    db = database.SessionLocal()
    try: yield db
    finally: db.close()

@router.post("/refresh")
def refresh_analytics(x_user_id: int = Header(...), db: Session = Depends(get_db)):
    files = db.query(models.File).filter(models.File.user_id == x_user_id).all()
    total_mb = sum(f.size_bytes for f in files) / (1024 * 1024)
    cost = round(total_mb * 0.10, 4) # $0.10 per MB
    
    snapshot = models.AnalyticsSnapshot(user_id=x_user_id, total_files=len(files), total_size_mb=total_mb, current_cost=cost)
    db.add(snapshot)
    db.commit()
    
    return {"message": "Updated", "current_cost": f"${cost}", "total_storage": f"{round(total_mb, 2)} MB"}

@router.get("/history")
def get_history(x_user_id: int = Header(...), db: Session = Depends(get_db)):
    return db.query(models.AnalyticsSnapshot).filter(models.AnalyticsSnapshot.user_id == x_user_id).order_by(models.AnalyticsSnapshot.recorded_at.asc()).all()