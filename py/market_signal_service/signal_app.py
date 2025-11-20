from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from py.trading_bots.api.routes import signal_routes
from market_signal_service.infrastructure.config.settings import Settings
from market_signal_service.infrastructure.logging.logger import setup_logger

settings = Settings()
logger = setup_logger()

app = FastAPI(
    title="Market Signal Service",
    description="BUY/SELL/HOLD signals based on technical indicators",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(signal_routes.router, prefix="")

@app.on_event("startup")
async def startup_event():
    logger.info("Market Signal Service started successfully")

@app.on_event("shutdown")
async def shutdown_event():
    logger.info("Market Signal Service shutting down")

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
