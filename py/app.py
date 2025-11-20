from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from trading_bots.api.routes import balance_routes
from trading_bots.api.routes import signal_routes
from trading_bots.api.routes import bot_routes
from jwt_middleware import jwt_middleware


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
    tags=["Market Signals"],
    dependencies=[Depends(jwt_middleware)]
)

app.include_router(
    bot_routes.router,
    prefix="/api/bots",
    tags=["Trading Bots"],
    dependencies=[Depends(jwt_middleware)]
)

app.include_router(
    balance_routes.router,
    prefix="/api",
    tags=["Balance"],
    dependencies=[Depends(jwt_middleware)]
)


@app.get("/")
async def root():
    return {
        "message": "Full Trading Platform API",
        "version": "1.0.0",
        "services": {
            "signal": "/api/signals",
            "bots": "/api/bots",
            "balances": "/api/balances",
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
            "bots": "active",
            "balances": "active"
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)