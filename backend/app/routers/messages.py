from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.models.outbound_message import OutboundMessage
from app.schemas.message import OutboundMessageCreate, OutboundMessageUpdate, OutboundMessageResponse
from app.services.email_service import EmailService
import logging

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/{lead_id}/messages", response_model=list[OutboundMessageResponse])
def list_messages(
    lead_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List all messages for a lead"""
    messages = (
        db.query(OutboundMessage)
        .filter(OutboundMessage.lead_id == lead_id)
        .order_by(OutboundMessage.created_at.desc())
        .all()
    )
    return messages


@router.post("/{lead_id}/messages", response_model=OutboundMessageResponse, status_code=201)
def create_message(
    lead_id: str,
    data: OutboundMessageCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a new outbound message for a lead"""
    try:
        logger.info(f"📤 Creating message for lead {lead_id}: {data.channel} to {data.to_address}")

        message = OutboundMessage(lead_id=lead_id, **data.model_dump())
        db.add(message)
        db.commit()
        db.refresh(message)

        logger.info(f"✅ Message saved successfully: {message.id} with status {message.status}")

        # Send message in background
        if data.status == "SENT":
            if data.channel == "EMAIL":
                background_tasks.add_task(
                    send_email_background,
                    to_address=data.to_address,
                    body=data.body_rendered,
                    subject=f"Message for {lead_id}",
                    message_id=message.id,
                    db_session=db,
                )
            elif data.channel == "INSTAGRAM":
                background_tasks.add_task(
                    send_instagram_background,
                    handle=data.to_address,
                    body=data.body_rendered,
                    message_id=message.id,
                    db_session=db,
                )

        return message
    except Exception as e:
        logger.error(f"❌ Error creating message: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error creating message: {str(e)}")


async def send_email_background(to_address: str, body: str, subject: str, message_id: str, db_session: Session):
    """Background task to send email"""
    try:
        success = await EmailService.send_email(to_address, "EMAIL", body, subject)
        # Update message status based on result
        message = db_session.query(OutboundMessage).filter(OutboundMessage.id == message_id).first()
        if message:
            if success:
                message.status = "SENT"
                logger.info(f"✅ Email sent for message {message_id}")
            else:
                message.status = "FAILED"
                message.error_message = "Failed to send email"
                logger.error(f"❌ Email failed for message {message_id}")
            db_session.commit()
    except Exception as e:
        logger.error(f"❌ Error in send_email_background: {str(e)}")


async def send_instagram_background(handle: str, body: str, message_id: str, db_session: Session):
    """Background task to send Instagram DM"""
    try:
        success = await EmailService.send_instagram_dm(handle, body)
        # Update message status based on result
        message = db_session.query(OutboundMessage).filter(OutboundMessage.id == message_id).first()
        if message:
            if success:
                message.status = "SENT"
                logger.info(f"✅ Instagram DM sent for message {message_id}")
            else:
                message.status = "FAILED"
                message.error_message = "Failed to send Instagram DM"
                logger.error(f"❌ Instagram DM failed for message {message_id}")
            db_session.commit()
    except Exception as e:
        logger.error(f"❌ Error in send_instagram_background: {str(e)}")


@router.patch("/{lead_id}/messages/{message_id}", response_model=OutboundMessageResponse)
def update_message(
    lead_id: str,
    message_id: str,
    data: OutboundMessageUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update a message"""
    from datetime import datetime

    message = (
        db.query(OutboundMessage)
        .filter(OutboundMessage.id == message_id, OutboundMessage.lead_id == lead_id)
        .first()
    )
    if not message:
        raise HTTPException(status_code=404, detail="Message not found")

    for field, value in data.model_dump(exclude_unset=True).items():
        if field == "status" and value == "SENT":
            message.sent_at = datetime.utcnow()
        setattr(message, field, value)

    db.commit()
    db.refresh(message)
    return message
