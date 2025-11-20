from fastapi import APIRouter
from market_signal_service.api.controllers.signal_controller import SignalController
router = APIRouter(tags=["signals"])

signal_controller = SignalController()

@router.get("/signals")
async def get_signal(
    symbol: str,
    timeframe: str = "1h",
    exchange: str = "binance"
):
    return await signal_controller.get_signal(symbol, timeframe, exchange)

