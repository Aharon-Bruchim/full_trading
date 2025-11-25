# Trading Bot Engine

Multi-exchange trading bot engine with ATR-based strategies.

## Supported Exchanges
- Bitunix
- Bybit

## Features
- ATR Dynamic Entry/Exit
- Hybrid Strategy (ATR + Percentage)
- Multi-level Entry
- Position Sizing based on volatility
- MongoDB integration
- Real-time updates via WebSocket
- Heartbeat monitoring

## Installation

```bash
pip install -r requirements.txt
```

## Configuration

Set environment variables:
```bash
MONGODB_URI=mongodb://localhost:27017/trading-platform
WEBHOOK_URL=http://backend:3000/api/webhooks/bot-update
WS_URL=ws://backend:3000/ws
```

## Usage

```bash
python bot_runner.py --bot-id=<bot_id>
```

## Structure

```
trading_bot_engine/
├── bot_runner.py          # Main entry point
├── db/                    # Database layer
├── exchanges/             # Exchange implementations
│   ├── bitunix/          # Bitunix exchange (complete)
│   └── bybit/            # Bybit exchange (complete)
├── models/               # Data models
├── notifications/        # Webhook/WebSocket notifications
└── shared/               # Shared utilities
```
