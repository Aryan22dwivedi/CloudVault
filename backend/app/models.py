from sqlalchemy import Column, Integer, String, Boolean, DateTime, Float, ForeignKey
from sqlalchemy.sql import func
from .database import Base

class File(Base):
    __tablename__ = "files"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, index=True)
    s3_key = Column(String)    # The object name in MinIO/S3
    size_bytes = Column(Integer)
    content_type = Column(String)
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Simple User ID (For demo, we might skip full Auth if you want speed)
    user_id = Column(Integer, default=1) 

class AnalyticsSnapshot(Base):
    __tablename__ = "analytics"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, default=1)
    total_files = Column(Integer)
    total_size_mb = Column(Float)
    current_cost = Column(Float) # The calculated cost
    recorded_at = Column(DateTime(timezone=True), server_default=func.now())

class ExtractedContact(Base):
    __tablename__ = "contacts"
    
    id = Column(Integer, primary_key=True, index=True)
    raw_text = Column(String)
    extracted_email = Column(String, nullable=True)
    extracted_phone = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    password = Column(String)
    name = Column(String)