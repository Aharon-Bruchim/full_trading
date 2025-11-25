#!/bin/bash

if [ -z "$1" ]; then
    echo "Usage: ./start_bot.sh <bot_id>"
    echo "Example: ./start_bot.sh 673d4f1234567890abcdef01"
    exit 1
fi

BOT_ID=$1

echo "Starting bot: $BOT_ID"

source .env

python3 bot_runner.py --bot-id=$BOT_ID
