from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.database import get_db
from app.models.user import User
from app.models.push_subscription import PushSubscription
from app.api.users import get_current_user

router = APIRouter()


class PushSubscriptionRequest(BaseModel):
    endpoint: str
    keys: dict


@router.post("/subscribe")
def subscribe(
    data: PushSubscriptionRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Save a push notification subscription."""
    existing = db.query(PushSubscription).filter(
        PushSubscription.user_id == current_user.id,
        PushSubscription.endpoint == data.endpoint
    ).first()

    if not existing:
        subscription = PushSubscription(
            user_id=current_user.id,
            endpoint=data.endpoint,
            p256dh=data.keys.get("p256dh"),
            auth=data.keys.get("auth")
        )
        db.add(subscription)
        db.commit()

    return {"message": "Subscribed to push notifications"}


@router.post("/unsubscribe")
def unsubscribe(
    data: PushSubscriptionRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Remove a push notification subscription."""
    db.query(PushSubscription).filter(
        PushSubscription.user_id == current_user.id,
        PushSubscription.endpoint == data.endpoint
    ).delete()
    db.commit()
    return {"message": "Unsubscribed from push notifications"}