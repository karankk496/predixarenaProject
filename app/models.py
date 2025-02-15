from sqlalchemy import Boolean, Column, String, DateTime, Enum
from sqlalchemy.sql import func
from .database import Base
import enum

class Role(str, enum.Enum):
    ADMIN = "ADMIN"
    OPS = "OPS"
    GENERAL = "GENERAL"

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    password = Column(String)
    first_name = Column(String, nullable=True)
    last_name = Column(String, nullable=True)
    display_name = Column(String, nullable=True)
    phone_number = Column(String, nullable=True)
    date_of_birth = Column(String, nullable=True)
    gender = Column(String, nullable=True)
    role = Column(Enum(Role), default=Role.GENERAL)
    is_super_user = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now()) 