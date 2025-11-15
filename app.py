from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from market_signal_service.api.routes import signal_routes
from trading_bots.api.routes import bot_routes

app = FastAPI(
    title="Full Trading Platform",
    description="Market Signals + Trading Bots Management",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(
    signal_routes.router,
    prefix="/api",
    tags=["Market Signals"]
)

app.include_router(
    bot_routes.router,
    prefix="/api/bots",
    tags=["Trading Bots"]
)

@app.get("/")
async def root():
    return {
        "message": "Full Trading Platform API",
        "version": "1.0.0",
        "services": {
            "signal": "/api/signal",
            "bots": "/api/bots",
            "docs": "/docs",
            "health": "/health"
        }
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "services": {
            "signals": "active",
            "bots": "active"
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
