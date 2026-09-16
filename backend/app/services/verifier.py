import random
from datetime import datetime, timedelta
from sqlalchemy import select
from app.db.session import AsyncSessionLocal
from app.models.demand_response import DispatchLog, Consumer

