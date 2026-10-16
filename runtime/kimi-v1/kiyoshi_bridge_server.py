"""
Kiyoshi WebSocket Bridge Server
This server acts as the Jacobian coupling the React Native UI to the Kiyoshi engine.
"""

import asyncio
import websockets
import json
from datetime import datetime

from kiyoshi_engine import process_message

async def handle_connection(websocket):
    print(f"[{datetime.now()}] Client connected to Kiyoshi bridge")

    try:
        async for message in websocket:
            data = json.loads(message)

            if data.get("type") == "message":
                user_input = data.get("content", "").strip()
                print(f"[{datetime.now()}] Received from UI: {user_input}")

                try:
                    response_text = await process_message(user_input)
                except Exception as e:
                    response_text = f"Engine error: {str(e)}"
                    print(f"Engine processing failed: {e}")

                print(f"[{datetime.now()}] Sending response back to UI...")
                await websocket.send(json.dumps({
                    "type": "response",
                    "content": response_text
                }))
                print(f"[{datetime.now()}] Response sent successfully.")

    except websockets.exceptions.ConnectionClosed:
        print(f"[{datetime.now()}] Client disconnected")
    except Exception as e:
        print(f"Bridge error: {e}")

async def main():
    print("Starting Kiyoshi WebSocket Bridge on ws://localhost:8765")
    print("Waiting for React Native client...")

    async with websockets.serve(handle_connection, "localhost", 8765):
        await asyncio.Future()

if __name__ == "__main__":
    asyncio.run(main())
