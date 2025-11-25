import requests
import os
from typing import Dict, Any
import logging


class WebhookNotifier:
    def __init__(self, webhook_url: str = None):
        self.webhook_url = webhook_url or os.getenv("WEBHOOK_URL")
        self.logger = logging.getLogger(__name__)
    
    def send_notification(self, event_type: str, data: Dict[str, Any]):
        if not self.webhook_url:
            self.logger.warning("Webhook URL not configured, skipping notification")
            return
        
        payload = {
            "event": event_type,
            "data": data,
            "timestamp": data.get("timestamp")
        }
        
        try:
            response = requests.post(
                self.webhook_url,
                json=payload,
                timeout=5
            )
            response.raise_for_status()
            self.logger.debug(f"Webhook sent: {event_type}")
        except Exception as e:
            self.logger.error(f"Failed to send webhook: {e}")
    
    def notify_position_opened(self, position: Dict[str, Any]):
        self.send_notification("POSITION_OPENED", position)
    
    def notify_position_closed(self, trade: Dict[str, Any]):
        self.send_notification("POSITION_CLOSED", trade)
    
    def notify_bot_started(self, bot_id: str):
        self.send_notification("BOT_STARTED", {"bot_id": bot_id})
    
    def notify_bot_stopped(self, bot_id: str, reason: str = None):
        self.send_notification("BOT_STOPPED", {
            "bot_id": bot_id,
            "reason": reason
        })
    
    def notify_error(self, bot_id: str, error: str):
        self.send_notification("BOT_ERROR", {
            "bot_id": bot_id,
            "error": error
        })
