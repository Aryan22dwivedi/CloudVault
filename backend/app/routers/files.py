from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Header
from sqlalchemy.orm import Session
from pydantic import BaseModel
import uuid
from .. import models, database, storage

router = APIRouter(prefix="/files", tags=["Files"])

class ShareRequest(BaseModel):
    expiry_seconds: int

def get_db():
    db = database.SessionLocal()
    try: yield db
    finally: db.close()

# 1. LIST FILES
@router.get("/")
def list_files(x_user_id: int = Header(...), db: Session = Depends(get_db)):
    files = db.query(models.File).filter(models.File.user_id == x_user_id).all()
    results = []
    for f in files:
        results.append({
            "id": f.id,
            "filename": f.filename,
            "size_mb": round(f.size_bytes / (1024 * 1024), 2),
            "uploaded_at": f.uploaded_at,
            "download_link": storage.generate_presigned_url(f.s3_key)
        })
    return results

# 2. UPLOAD FILE
@router.post("/upload/")
async def upload_file(file: UploadFile = File(...), x_user_id: int = Header(...), db: Session = Depends(get_db)):
    file_ext = file.filename.split(".")[-1] if "." in file.filename else "file"
    # Create USER SPECIFIC FOLDER
    s3_key = f"user_{x_user_id}/{uuid.uuid4()}.{file_ext}"
    
    file.file.seek(0, 2)
    size_bytes = file.file.tell()
    file.file.seek(0)
    
    if storage.upload_file_to_s3(file.file, s3_key, file.content_type):
        new_file = models.File(filename=file.filename, s3_key=s3_key, size_bytes=size_bytes, content_type=file.content_type, user_id=x_user_id)
        db.add(new_file)
        db.commit()
        return {"status": "success"}
    raise HTTPException(500, "Upload failed")

# 3. DELETE FILE
@router.delete("/{file_id}")
def delete_file(file_id: int, x_user_id: int = Header(...), db: Session = Depends(get_db)):
    file = db.query(models.File).filter(models.File.id == file_id, models.File.user_id == x_user_id).first()
    if not file: raise HTTPException(404, "File not found")
    
    storage.s3_client.delete_object(Bucket=storage.BUCKET_NAME, Key=file.s3_key)
    db.delete(file)
    db.commit()
    return {"status": "deleted"}

# 4. DOWNLOAD
@router.get("/{file_id}/download")
def download_file(file_id: int, x_user_id: int = Header(...), db: Session = Depends(get_db)):
    file = db.query(models.File).filter(models.File.id == file_id, models.File.user_id == x_user_id).first()
    if not file: raise HTTPException(404, "File not found")
    
    url = storage.generate_presigned_url(file.s3_key, expiration=300, force_download=True, filename=file.filename)
    return {"download_url": url}

# 5. SHARE
@router.post("/{file_id}/share")
def share_file(file_id: int, request: ShareRequest, x_user_id: int = Header(...), db: Session = Depends(get_db)):
    file = db.query(models.File).filter(models.File.id == file_id, models.File.user_id == x_user_id).first()
    if not file: raise HTTPException(404, "File not found")
    
    url = storage.generate_presigned_url(file.s3_key, expiration=request.expiry_seconds)
    return {"share_link": url}