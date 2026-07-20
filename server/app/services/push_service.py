import json
from pywebpush import webpush, WebPushException
from sqlalchemy.orm import Session
from app.models.push_subscription import PushSubscription
from app.config import settings


def send_push_notification(user_id: str, title: str, body: str, db: Session):
    """Send a push notification to all of a user's devices."""
    subscriptions = db.query(PushSubscription).filter(
        PushSubscription.user_id == user_id
    ).all()

    if not subscriptions:
        return

    payload = json.dumps({
        "title": title,
        "body": body,
        "icon": "/icons/icon-192.png",
        "badge": "/icons/icon-192.png",
        "tag": "serenity-notification",
        "requireInteraction": False,
        "silent": False,
        "actions": []
    })

    for subscription in subscriptions:
        try:
            webpush(
                subscription_info={
                    "endpoint": subscription.endpoint,
                    "keys": {
                        "p256dh": subscription.p256dh,
                        "auth": subscription.auth
                    }
                },
                data=payload,
                vapid_private_key=settings.VAPID_PRIVATE_KEY,
                vapid_claims={
                    "sub": f"mailto:{settings.VAPID_CLAIMS_EMAIL}"
                }
            )
        except WebPushException as e:
            if e.response and e.response.status_code in [404, 410]:
                # Subscription expired — remove it
                db.delete(subscription)
                db.commit()