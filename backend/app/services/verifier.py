import random
from datetime import datetime, timedelta
from sqlalchemy import select
from app.db.session import AsyncSessionLocal
from app.models.demand_response import DispatchLog, Consumer
from app.services.scheduler_instance import scheduler

async def perform_audit_check(dispatch_log_id:int,audit_number:int):

    async with AsyncSessionLocal() as db:
        log = await db.get(DispatchLog, dispatch_log_id)
        if not log or log.verification_status == "FAILED":
            return  

        consumer = await db.get(Consumer, log.consumer_id)
        if not consumer:
            return
    allowed_max_kw = log.baseline_kw * (1 - (log.reduction_percent / 100.0))
    print(f"[Audit #{audit_number} Check] Log ID: {log.id} | Phone: {consumer.phone}")
    print(f"Current Draw: {consumer.current_kw} kW | Max Allowed: {round(allowed_max_kw, 2)} kW")

    if consumer.current_kw > allowed_max_kw:
        log.verification_status = "FAILED"
        log.failed_reason = (
            f"Audit #{audit_number} failed: Consuming {consumer.current_kw} kW "
            f"(Threshold: {round(allowed_max_kw, 2)} kW)"
        )
        print(f"[Verification Failed] Consumer {consumer.phone} breached target.")
    else:
        log.audits_completed += 1
            # If all 3 audits passed, mark verified
        if log.audits_completed >= 3:
            log.verification_status = "VERIFIED"
            print(f"[Verification Success] Consumer {consumer.phone} passed all 3 spot audits!")

    db.commit()

def schedule_random_audits(dispatch_log_id: int, window_minutes: int = 1):
    audit_offsets = sorted(random.sample(range(3, window_minutes - 2), 3))
    now=datetime.now()
    for idx, offset in enumerate(audit_offsets, start=1):
        run_time = now + timedelta(minutes=offset)
        scheduler.add_job(
            perform_audit_check,
            trigger="date",
            run_date=run_time,
            args=[dispatch_log_id, idx],
            id=f"audit_{dispatch_log_id}_{idx}",
            replace_existing=True
        )