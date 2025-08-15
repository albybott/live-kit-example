#!/bin/bash

echo "🧪 Testing LiveKit Implementation"
echo "================================="

# Test health endpoint
echo -e "\n1️⃣ Testing Health Endpoint..."
curl -s http://localhost:3001/health | jq .

# Test token generation
echo -e "\n2️⃣ Testing Token Generation..."
curl -s -X POST http://localhost:3001/api/token \
  -H "Content-Type: application/json" \
  -d '{"roomName":"test-room","participantName":"TestUser"}' | jq .

# Test with different room and user
echo -e "\n3️⃣ Testing Token Generation (Different Room)..."
curl -s -X POST http://localhost:3001/api/token \
  -H "Content-Type: application/json" \
  -d '{"roomName":"demo-voice-chat","participantName":"Alice"}' | jq .

echo -e "\n✅ LiveKit tests completed!"
echo -e "\n📱 To test the web interface:"
echo "   - Open http://localhost:3001/ in your browser"
echo "   - Or use the curl commands above"
echo -e "\n🚀 LiveKit server is running on http://localhost:3001"
