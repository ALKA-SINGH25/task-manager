from datetime import datetime, timezone
from typing import Optional
from bson import ObjectId
import logging
from database import db
from models.expense import serialize_expense
from core.redis_client import get_cache, set_cache, invalidate_cache, invalidate_cache_pattern

collection = db["expenses"]
logger = logging.getLogger(__name__)

def _utc_now() -> datetime:
    return datetime.now(timezone.utc)

def _stringify_id(document: dict) -> dict:
    document["_id"] = str(document["_id"])
    return document

def _invalidate_expense_caches(user_id: str):
    if user_id:
        invalidate_cache(f"expense_dashboard:{user_id}")
        invalidate_cache_pattern(f"expenses:{user_id}*")

def create_expense(expense_data: dict) -> str:
    now = _utc_now()
    new_id = ObjectId()
    expense_data["_id"] = new_id
    expense_data["created_at"] = now
    expense_data["updated_at"] = now
    expense_data["is_active"] = True
    
    collection.insert_one(expense_data)
    _invalidate_expense_caches(expense_data.get("user_id"))
    return str(new_id)

def get_filtered_expenses(
    user_id: str,
    search: Optional[str] = None,
    category: Optional[str] = None,
    month: Optional[str] = None,
    year: Optional[str] = None,
    sort_field: str = "expense_date",
    sort_order: str = "desc"
) -> list:
    cat_key = category if category else "all"
    month_key = month if month else "all"
    year_key = year if year else "all"
    search_key = search if search else "all"
    
    cache_key = f"expenses:{user_id}:{cat_key}:{month_key}:{year_key}:{sort_field}:{sort_order}:{search_key}"
    cached_data = get_cache(cache_key)
    if cached_data is not None:
        return cached_data
        
    logger.info("CACHE MISS")
    
    query = {"user_id": user_id, "is_active": True}
    
    if search:
        query["$or"] = [
            {"title": {"$regex": search, "$options": "i"}},
            {"description": {"$regex": search, "$options": "i"}}
        ]
        
    if category and category != "all":
        query["category"] = category
        
    date_exprs = []
    if year:
        date_exprs.append({"$eq": [{"$year": "$expense_date"}, int(year)]})
    if month:
        date_exprs.append({"$eq": [{"$month": "$expense_date"}, int(month)]})
        
    if date_exprs:
        query["$expr"] = {"$and": date_exprs}

    sort_dir = 1 if sort_order == "asc" else -1
    if sort_field not in ["expense_date", "amount", "category", "created_at"]:
        sort_field = "expense_date"
        
    expenses = []
    for expense in collection.find(query).sort(sort_field, sort_dir):
        expenses.append(serialize_expense(_stringify_id(expense)))
        
    set_cache(cache_key, expenses, ttl=120)
    return expenses

def get_expense_by_id(expense_id: str, user_id: Optional[str] = None) -> Optional[dict]:
    try:
        obj_id = ObjectId(expense_id)
    except:
        return None
        
    query = {"_id": obj_id, "is_active": True}
    if user_id is not None:
        query["user_id"] = user_id

    expense = collection.find_one(query)
    if not expense:
        return None
    return serialize_expense(_stringify_id(expense))

def get_expense_document(expense_id: str, user_id: Optional[str] = None) -> Optional[dict]:
    try:
        obj_id = ObjectId(expense_id)
    except:
        return None
        
    query = {"_id": obj_id, "is_active": True}
    if user_id is not None:
        query["user_id"] = user_id

    expense = collection.find_one(query)
    if not expense:
        return None
    return _stringify_id(expense)

def update_expense(expense_id: str, expense_data: dict) -> Optional[dict]:
    try:
        obj_id = ObjectId(expense_id)
    except:
        return None

    expense_data["updated_at"] = _utc_now()
    
    updated_expense = collection.find_one_and_update(
        {"_id": obj_id, "is_active": True},
        {"$set": expense_data},
        return_document=True
    )
    if not updated_expense:
        return None

    _invalidate_expense_caches(updated_expense.get("user_id"))
    return serialize_expense(_stringify_id(updated_expense))

def soft_delete_expense(expense_id: str) -> Optional[dict]:
    try:
        obj_id = ObjectId(expense_id)
    except:
        return None

    deleted_expense = collection.find_one_and_update(
        {"_id": obj_id, "is_active": True},
        {"$set": {"is_active": False, "updated_at": _utc_now()}},
        return_document=True
    )
    if not deleted_expense:
        return None
        
    _invalidate_expense_caches(deleted_expense.get("user_id"))
    return serialize_expense(_stringify_id(deleted_expense))

def get_expense_analytics(user_id: str) -> dict:
    cache_key = f"expense_dashboard:{user_id}"
    cached_data = get_cache(cache_key)
    if cached_data is not None:
        return cached_data

    logger.info("ANALYTICS CACHE MISS")
    
    current_year = datetime.now(timezone.utc).year
    current_month = datetime.now(timezone.utc).month

    pipeline = [
        {"$match": {"user_id": user_id, "is_active": True}},
        {
            "$facet": {
                "overall_stats": [
                    {
                        "$group": {
                            "_id": None,
                            "total_expenses": {"$sum": "$amount"},
                            "transaction_count": {"$sum": 1}
                        }
                    }
                ],
                "monthly_stats": [
                    {
                        "$group": {
                            "_id": {
                                "year": {"$year": "$expense_date"},
                                "month": {"$month": "$expense_date"}
                            },
                            "amount": {"$sum": "$amount"}
                        }
                    }
                ],
                "category_stats": [
                    {
                        "$group": {
                            "_id": "$category",
                            "amount": {"$sum": "$amount"}
                        }
                    },
                    {"$sort": {"amount": -1}}
                ]
            }
        }
    ]

    cursor = collection.aggregate(pipeline)
    result = list(cursor)[0]

    overall = result.get("overall_stats", [])
    if not overall:
        empty_res = {
            "total_expenses": 0,
            "this_month": 0,
            "monthly_average": 0,
            "top_category": "—",
            "transaction_count": 0,
            "category_distribution": [],
            "monthly_analytics": []
        }
        set_cache(cache_key, empty_res, ttl=300)
        return empty_res

    total_expenses = overall[0]["total_expenses"]
    transaction_count = overall[0]["transaction_count"]

    monthly = result.get("monthly_stats", [])
    this_month_amount = 0
    distinct_months = len(monthly)
    
    monthly_analytics_map = {m: 0 for m in range(1, 13)}
    
    for m in monthly:
        if m["_id"]["year"] == current_year and m["_id"]["month"] == current_month:
            this_month_amount = m["amount"]
        if m["_id"]["year"] == current_year:
            monthly_analytics_map[m["_id"]["month"]] += m["amount"]
            
    monthly_average = total_expenses / distinct_months if distinct_months > 0 else 0

    cats = result.get("category_stats", [])
    top_category = cats[0]["_id"] if cats else "—"
    
    category_distribution = []
    for c in cats:
        cat_amount = c["amount"]
        category_distribution.append({
            "id": c["_id"],
            "label": c["_id"],
            "value": cat_amount,
            "category": c["_id"],
            "amount": cat_amount,
            "percentage": round((cat_amount / total_expenses * 100) if total_expenses > 0 else 0)
        })

    month_names = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    monthly_analytics = []
    for m in range(1, 13):
        monthly_analytics.append({
            "month": month_names[m-1],
            "amount": monthly_analytics_map[m]
        })

    analytics_res = {
        "total_expenses": total_expenses,
        "this_month": this_month_amount,
        "monthly_average": monthly_average,
        "top_category": top_category,
        "transaction_count": transaction_count,
        "category_distribution": category_distribution,
        "monthly_analytics": monthly_analytics
    }

    set_cache(cache_key, analytics_res, ttl=300)
    return analytics_res
