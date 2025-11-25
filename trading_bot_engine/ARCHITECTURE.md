# Trading Bot Engine - Architecture

## Overview

This is a multi-exchange trading bot engine that supports ATR-based strategies for cryptocurrency trading.

## Supported Exchanges

- **Bitunix**: Full support with `trade_side` and `position_id` parameters
- **Bybit**: Full support with `reduce_only` and `position_idx` parameters

## Architecture

```
┌─────────────┐
│   MongoDB   │  ← Stores: Bot configs, Positions, Trades
└──────┬──────┘
       │
       ↓
┌─────────────────────────────────────┐
│         Bot Runner (Python)         │
│  ┌──────────────────────────────┐   │
│  │  1. Load Config from MongoDB │   │
│  │  2. Initialize Exchange      │   │
│  │  3. Initialize Strategy      │   │
│  │  4. Main Loop (every 5s)     │   │
│  └──────────────────────────────┘   │
└──────────┬──────────────────────────┘
           │
           ├─→ Sends Heartbeat to MongoDB
           ├─→ Saves Positions to MongoDB
           ├─→ Saves Trades to MongoDB
           └─→ Sends Webhooks to Backend
```

## Strategy Flow

### Long Dip ATR Strategy:

1. **Update Price Data**
   - Fetch current price
   - Update candle manager
   - Calculate ATR when candle completes

2. **Check Entry Signal**
   - Track recent high price
   - Detect if price dropped ≥ ATR × multiplier
   - Adjust multiplier based on volatility
   - Calculate position size based on dip size
   - Generate BUY signal

3. **Execute Entry**
   - Place Market BUY order
   - Calculate target = entry + (ATR × target_multiplier)
   - Calculate stop_loss = entry - (ATR × sl_multiplier)
   - Save position to MongoDB
   - Reserve budget

4. **Monitor Position**
   - Check if price ≥ target → Close position
   - Check if price ≤ stop_loss → Close position
   - Update trailing stop if enabled

5. **Execute Exit**
   - Place Market SELL order
   - Calculate PnL
   - Save trade to MongoDB
   - Release budget
   - Send notification

## Key Components

### 1. Candle Manager
- Aggregates real-time price updates into candles
- Manages timeframe (5m, 15m, 30m, etc.)
- Provides completed candles for ATR calculation

### 2. ATR Calculator
- Calculates Average True Range from candles
- Provides ATR percentage (volatility measure)
- Dynamically adjusts entry multiplier based on volatility

### 3. Position Manager
- Tracks open positions
- Calculates unrealized PnL
- Updates trailing stops
- Closes positions and generates trades

### 4. Budget Manager
- Manages allocated budget
- Calculates position size based on:
  - Dip size (how many ATRs dropped)
  - Volatility (current ATR%)
  - Remaining budget
- Reserves/releases budget

## Position Sizing

The bot uses **dynamic position sizing**:

```
Dip Size    →  Budget %
─────────────────────────
1.0× ATR    →  5%
1.5× ATR    →  8%
2.0× ATR    →  12%
2.5× ATR    →  15%
```

**Volatility Adjustment:**
- High volatility (ATR% > 3%) → Reduce size by 30%
- Medium volatility (ATR% > 2%) → Reduce size by 15%
- Low volatility (ATR% < 2%) → Full size

## Configuration

All configuration is stored in MongoDB in the `bots` collection:

```javascript
{
  "_id": "bot_id",
  "user_id": "user_id",
  "exchange": "bitunix",
  "config": {
    "trading": {...},
    "atr": {...},
    "budget": {...},
    "risk_management": {...}
  }
}
```

## Exchange-Specific Details

### Bitunix
```python
client.place_order(
    symbol='BTCUSDT',
    side='BUY',
    qty=0.001,
    trade_side='OPEN',      # Required
    position_id='...'       # Optional
)
```

### Bybit
```python
client.place_order(
    symbol='BTCUSDT',
    side='Buy',
    qty=0.001,
    reduce_only=False,      # Required
    position_idx=0          # 0=One-Way, 1=Long, 2=Short
)
```

## Running a Bot

```bash
python bot_runner.py --bot-id=<mongodb_bot_id>
```

The bot will:
1. Load configuration from MongoDB
2. Connect to the exchange
3. Run the strategy
4. Send heartbeat every 30 seconds
5. Update performance every 5 minutes
6. Listen for remote stop commands

## Monitoring

### Heartbeat
Every 30 seconds, the bot updates `last_heartbeat` in MongoDB.

### Performance Updates
Every 5 minutes, the bot updates:
- `total_realized_pnl`
- `total_unrealized_pnl`
- `trades_today`
- `win_rate`

### Notifications
The bot sends webhooks for:
- Bot started
- Position opened
- Position closed
- Bot stopped
- Errors

## Safety Features

1. **Risk Management**
   - Max trades per minute/hour/day
   - Max position size limit
   - Bot stop loss (total PnL threshold)

2. **Budget Management**
   - Never exceeds allocated budget
   - Reserves budget when opening positions
   - Releases budget when closing positions

3. **Graceful Shutdown**
   - Handles SIGTERM, SIGINT, SIGHUP
   - Updates status in MongoDB
   - Sends final notifications

4. **Error Recovery**
   - Retries on API failures
   - Logs all errors
   - Continues running on non-critical errors

## Adding New Exchanges

To add a new exchange:

1. Create `exchanges/<exchange_name>/`
2. Implement `core/client.py` with:
   - `get_ticker()`
   - `place_order()`
   - `get_open_positions()`
   - `get_lot_size_filter()`
   - `round_quantity()`

3. Copy strategy from existing exchange
4. Update `bot_runner.py` to import new exchange
5. Done!

Each exchange is completely independent.
