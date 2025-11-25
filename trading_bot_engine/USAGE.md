# Usage Guide

## Installation

1. **Install Dependencies**
```bash
pip install -r requirements.txt
```

2. **Setup Environment**
```bash
cp .env.example .env
# Edit .env with your MongoDB URI and webhook URL
```

3. **Setup MongoDB**

Make sure MongoDB is running and create the database:
```bash
mongosh
use trading-platform
```

## Creating a Bot

### Step 1: Insert Bot Configuration in MongoDB

```javascript
db.bots.insertOne({
  "_id": ObjectId(),
  "user_id": ObjectId("your_user_id"),
  "name": "BTC Long 15m",
  "exchange": "bitunix",
  "status": "CREATED",
  "created_at": new Date(),
  "updated_at": new Date(),
  
  "config": {
    "trading": {
      "symbol": "BTCUSDT",
      "mode": "ISOLATED",
      "leverage": 10
    },
    "timeframe": {
      "candle_size": "15m",
      "update_interval": 5
    },
    "strategy": {
      "type": "long_dip_atr",
      "direction": "LONG"
    },
    "atr": {
      "enabled": true,
      "period": 10,
      "entry_multiplier": 0.8,
      "target_multiplier": 1.0,
      "stop_loss_multiplier": 1.5
    },
    "budget": {
      "allocated_amount": 2000.0,
      "max_position_percentage": 0.50,
      "position_sizing": {
        "mode": "dip_size_based",
        "levels": [
          {"atr_multiplier": 1.0, "budget_percentage": 0.05},
          {"atr_multiplier": 1.5, "budget_percentage": 0.08},
          {"atr_multiplier": 2.0, "budget_percentage": 0.12}
        ]
      }
    },
    "risk_management": {
      "max_trades_per_minute": 1,
      "max_trades_per_hour": 3,
      "max_trades_per_day": 12,
      "max_concurrent_positions": 5
    },
    "exit": {
      "trailing_stop": {
        "enabled": true,
        "activation_atr_multiplier": 0.5,
        "trail_distance_atr_multiplier": 0.4
      }
    },
    "fees": {
      "maker": 0.0002,
      "taker": 0.0006
    }
  }
})
```

### Step 2: Add Exchange Connection

```javascript
db.exchange_connections.insertOne({
  "_id": ObjectId(),
  "user_id": ObjectId("your_user_id"),
  "exchange": "bitunix",
  "api_key": "your_encrypted_api_key",
  "api_secret": "your_encrypted_api_secret",
  "status": "ACTIVE",
  "created_at": new Date()
})
```

### Step 3: Start the Bot

```bash
./start_bot.sh <bot_id>
```

Or directly:
```bash
python bot_runner.py --bot-id=<bot_id>
```

## Configuration Parameters

### Trading Settings

```javascript
"trading": {
  "symbol": "BTCUSDT",           // Trading pair
  "mode": "ISOLATED",             // ISOLATED or CROSS
  "leverage": 10                  // Leverage (1-125)
}
```

### Timeframe Settings

```javascript
"timeframe": {
  "candle_size": "15m",          // 1m, 5m, 15m, 30m, 1h, 4h, 1d
  "update_interval": 5            // Check price every N seconds
}
```

### ATR Settings

```javascript
"atr": {
  "enabled": true,
  "period": 10,                   // ATR period (7-21 recommended)
  "entry_multiplier": 0.8,        // Entry when drop ≥ ATR × 0.8
  "target_multiplier": 1.0,       // Target = entry + (ATR × 1.0)
  "stop_loss_multiplier": 1.5     // SL = entry - (ATR × 1.5)
}
```

**Entry Multiplier Guide:**
- `0.6` - Aggressive (many trades)
- `0.8` - Balanced (recommended)
- `1.0` - Conservative (fewer trades)
- `1.5` - Very conservative

### Budget Settings

```javascript
"budget": {
  "allocated_amount": 2000.0,           // Total budget for this bot
  "max_position_percentage": 0.50,      // Max 50% in positions
  
  "position_sizing": {
    "mode": "dip_size_based",
    "levels": [
      {"atr_multiplier": 1.0, "budget_percentage": 0.05},  // Small dip = 5%
      {"atr_multiplier": 1.5, "budget_percentage": 0.08},  // Medium = 8%
      {"atr_multiplier": 2.0, "budget_percentage": 0.12}   // Large = 12%
    ]
  }
}
```

### Risk Management

```javascript
"risk_management": {
  "max_trades_per_minute": 1,      // Rate limiting
  "max_trades_per_hour": 3,
  "max_trades_per_day": 12,
  "max_daily_loss": -100.0,        // Stop if daily loss > $100
  "max_concurrent_positions": 5,   // Max open positions
  "bot_stop_loss": -200.0          // Stop bot if total PnL < -$200
}
```

### Exit Settings

```javascript
"exit": {
  "trailing_stop": {
    "enabled": true,
    "activation_atr_multiplier": 0.5,    // Activate when profit > 0.5× ATR
    "trail_distance_atr_multiplier": 0.4  // Trail at 0.4× ATR behind price
  }
}
```

## Monitoring

### Check Bot Status

```javascript
db.bots.findOne({"_id": ObjectId("bot_id")})
```

### View Open Positions

```javascript
db.positions.find({
  "bot_id": ObjectId("bot_id"),
  "status": "OPEN"
})
```

### View Recent Trades

```javascript
db.trades.find({
  "bot_id": ObjectId("bot_id")
}).sort({"closed_at": -1}).limit(10)
```

### Check Performance

```javascript
db.bots.findOne(
  {"_id": ObjectId("bot_id")},
  {"performance": 1}
)
```

## Stopping a Bot

### Method 1: Graceful Stop (Recommended)

Update the bot status in MongoDB:
```javascript
db.bots.updateOne(
  {"_id": ObjectId("bot_id")},
  {"$set": {"status": "STOPPED"}}
)
```

The bot will detect the change and shut down gracefully within 60 seconds.

### Method 2: Process Kill

```bash
kill -SIGTERM <process_id>
```

The bot will handle the signal and shut down gracefully.

### Method 3: Force Kill (Not Recommended)

```bash
kill -9 <process_id>
```

This will kill the bot immediately without cleanup.

## Logs

Bot logs are stored in:
```
./logs/<bot_id>.log
```

View logs:
```bash
tail -f ./logs/<bot_id>.log
```

## Troubleshooting

### Bot Not Starting

1. Check MongoDB connection:
```bash
mongosh $MONGODB_URI
```

2. Check if bot exists:
```javascript
db.bots.findOne({"_id": ObjectId("bot_id")})
```

3. Check exchange connection:
```javascript
db.exchange_connections.findOne({
  "user_id": ObjectId("user_id"),
  "exchange": "bitunix"
})
```

### Bot Not Trading

1. Check if ATR is ready (needs 11+ candles):
```bash
tail -f ./logs/<bot_id>.log | grep "ATR"
```

2. Check entry conditions:
   - Is there a recent high price?
   - Has price dropped enough?
   - Is budget available?

3. Check risk limits:
   - Max trades per hour reached?
   - Max positions reached?
   - Daily loss limit reached?

### Bot Crashed

Check the logs for errors:
```bash
tail -100 ./logs/<bot_id>.log
```

Common issues:
- API rate limits
- Invalid API keys
- Network issues
- MongoDB connection lost

## Best Practices

1. **Start with small budget** - Test with $100-500 first
2. **Monitor for 24 hours** - Check if ATR levels are appropriate
3. **Adjust entry_multiplier** - If too many/few trades
4. **Use trailing stops** - Protect profits on winning trades
5. **Set bot_stop_loss** - Limit maximum loss
6. **Check logs regularly** - Catch issues early

## Example Configurations

### Conservative (Long-term Swing)
```javascript
"timeframe": {"candle_size": "1h"},
"atr": {
  "period": 14,
  "entry_multiplier": 1.5
}
```

### Balanced (Intraday)
```javascript
"timeframe": {"candle_size": "15m"},
"atr": {
  "period": 10,
  "entry_multiplier": 0.8
}
```

### Aggressive (Scalping)
```javascript
"timeframe": {"candle_size": "5m"},
"atr": {
  "period": 7,
  "entry_multiplier": 0.6
}
```
