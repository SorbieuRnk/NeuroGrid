from datetime import datetime
from sqlalchemy import String, Float, Integer, DateTime, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.session import Base

class Consumer(Base):
    __tablename__ = "consumers"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    phone: Mapped[str] = mapped_column(String(20), unique=True, index=True)
    household_name: Mapped[str] = mapped_column(String(100), default="Primary Residence")
    current_kw: Mapped[float] = mapped_column(Float, default=0.0)
    reward_preference: Mapped[str] = mapped_column(String(100), default="Electricity Bill Discount")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    dispatch_records: Mapped[list["DispatchLog"]] = relationship(back_populates="consumer")

class DispatchLog(Base):
    __tablename__ = "dispatch_logs"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    consumer_id: Mapped[int] = mapped_column(ForeignKey("consumers.id"))
    temperature: Mapped[float] = mapped_column(Float)
    humidity: Mapped[float] = mapped_column(Float)
    calculated_kw_deficit: Mapped[float] = mapped_column(Float)
    baseline_kw: Mapped[float] = mapped_column(Float)
    reduction_percent: Mapped[int] = mapped_column(Integer)
    target_reduction_kw: Mapped[float] = mapped_column(Float)
    message_body: Mapped[str] = mapped_column(Text)
    dispatched_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    consumer: Mapped["Consumer"] = relationship(back_populates="dispatch_records")