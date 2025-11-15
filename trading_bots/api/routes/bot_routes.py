from fastapi import APIRouter, HTTPException
from typing import List
from pydantic import BaseModel
from trading_bots.domain.services.bot_manager import BotManager

router = APIRouter()

bot_manager = BotManager()
class StartBotRequest(BaseModel):
    bot_type: str
    symbol: str
    exchange: str = "bitunix"
    config: dict = {}

class BotStatusResponse(BaseModel):
    bot_id: str
    type: str
    symbol: str
    status: str
    started_at: str = None
    stopped_at: str = None

@router.get("/", response_model=List[BotStatusResponse])
async def list_bots():
    if bot_manager is None:
        return []
    
    bots = bot_manager.get_all_bots()
    return bots

@router.post("/start")
async def start_bot(request: StartBotRequest):
    if bot_manager is None:
        raise HTTPException(status_code=503, detail="Bot manager not initialized")
    
    try:
        bot_id = bot_manager.start_bot(
            bot_type=request.bot_type,
            symbol=request.symbol,
            config=request.config
        )
        return {
            "status": "started",
            "bot_id": bot_id,
            "message": f"Bot {request.bot_type} started for {request.symbol}"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{bot_id}/stop")
async def stop_bot(bot_id: str):
    if bot_manager is None:
        raise HTTPException(status_code=503, detail="Bot manager not initialized")
    
    success = bot_manager.stop_bot(bot_id)
    if not success:
        raise HTTPException(status_code=404, detail="Bot not found")
    
    return {
        "status": "stopped",
        "bot_id": bot_id
    }

@router.get("/{bot_id}/status", response_model=BotStatusResponse)
async def get_bot_status(bot_id: str):
    if bot_manager is None:
        raise HTTPException(status_code=503, detail="Bot manager not initialized")
    
    status = bot_manager.get_bot_status(bot_id)
    if not status:
        raise HTTPException(status_code=404, detail="Bot not found")
    
    return status

@router.delete("/{bot_id}")
async def delete_bot(bot_id: str):
    if bot_manager is None:
        raise HTTPException(status_code=503, detail="Bot manager not initialized")
    
    success = bot_manager.delete_bot(bot_id)
    if not success:
        raise HTTPException(status_code=404, detail="Bot not found")
    
    return {
        "status": "deleted",
        "bot_id": bot_id
    }