# LiveKit Implementation Guide

This document describes the LiveKit implementation in this project.

## Overview

The LiveKit implementation provides a token server that issues JWT tokens for LiveKit Cloud rooms. It's designed to work with the existing TypeScript/ESM project structure.

## Architecture

- **Token Server**: Express.js server that generates LiveKit JWT tokens
- **API Endpoints**:
  - `GET /` - Web interface for testing
  - `GET /client` - LiveKit client for joining rooms
  - `GET /health` - Health check endpoint
  - `POST /api/token` - Token generation endpoint
- **Integrated Web Interface**: HTML page served directly from the LiveKit server
- **LiveKit Client**: Full-featured client that actually connects to rooms

## Files Structure

```
src/
├── livekit/
│   └── server.ts          # LiveKit token server with integrated web interface
public/
├── index.html             # Token generator test page
└── livekit-client.html    # LiveKit client for joining rooms
```

## Configuration

The server uses the following environment variables (already configured in `.env`):

```env
LIVEKIT_URL=wss://my-voice-ai-wnekndy7.livekit.cloud
LIVEKIT_API_KEY=API7dbvUaPJCVLg
LIVEKIT_API_SECRET=QlpDuqJYbqq1VOSeYluBmUzkvOGZ7WMFabI7vTrtaUF
PORT=3001
NODE_ENV=development
```

## Usage

### Development

Start the LiveKit token server:

```bash
pnpm dev:livekit
```

The server will run on `http://localhost:3001` with hot reloading.

### Testing

1. **Health Check**:

   ```bash
   curl http://localhost:3001/health
   ```

2. **Token Generation**:

   ```bash
   curl -X POST http://localhost:3001/api/token \
     -H "Content-Type: application/json" \
     -d '{"roomName":"test-room","participantName":"User123"}'
   ```

3. **Web Interface**:
   - The web interface is now served directly from the LiveKit server
   - Open `http://localhost:3001/` in your browser
   - Use the form to test token generation

### Production

Build and start the server:

```bash
pnpm build
pnpm start:livekit
```

## API Reference

### POST /api/token

Generates a LiveKit JWT token for joining a room.

**Request Body:**

```json
{
  "roomName": "string",
  "participantName": "string"
}
```

**Response:**

```json
{
  "token": "string",
  "serverUrl": "string",
  "roomName": "string",
  "participantName": "string"
}
```

**Error Response:**

```json
{
  "error": "string",
  "details": "string"
}
```

### GET /health

Health check endpoint.

**Response:**

```json
{
  "status": "ok",
  "message": "LiveKit Token Server is running"
}
```

## Dependencies

- `livekit-server-sdk` - LiveKit server SDK for token generation
- `express` - Web framework
- `cors` - CORS middleware
- `dotenv` - Environment variable loading
- `livekit-client` - LiveKit client SDK (loaded via CDN: `https://cdn.jsdelivr.net/npm/livekit-client/dist/livekit-client.umd.min.js`)

## Technical Notes

### LiveKit Client Library

The web client uses the official LiveKit client SDK loaded via CDN:

- **CDN URL**: `https://cdn.jsdelivr.net/npm/livekit-client/dist/livekit-client.umd.min.js`
- **Global Namespace**: `window.LivekitClient` (note the lowercase 'k')
- **Format**: UMD (Universal Module Definition) for browser compatibility
- **Version**: Latest stable (auto-updated)

## Security Notes

- The API key and secret are stored in environment variables
- CORS is enabled for development (configure appropriately for production)
- Input validation is performed on room name and participant name
- Error messages don't expose sensitive information

## Integration

The token server can be used by:

1. **Web Clients**: Use the generated token with LiveKit client SDKs
2. **Mobile Apps**: Same token generation process
3. **Desktop Apps**: Integrate with LiveKit desktop SDKs

## Troubleshooting

### Common Issues

1. **Port already in use**: Change the `PORT` environment variable
2. **CORS errors**: Ensure the client origin is allowed
3. **Invalid credentials**: Verify LiveKit API key/secret in `.env`
4. **Token generation fails**: Check LiveKit Cloud project status

### Debug Mode

Run with debug logging:

```bash
NODE_ENV=development DEBUG=* pnpm dev:livekit
```

## Next Steps

To extend this implementation:

1. **Add authentication**: Integrate with your existing auth system
2. **Room management**: Add endpoints for room creation/deletion
3. **Participant tracking**: Log and monitor room participants
4. **Webhook integration**: Handle LiveKit webhooks for events
5. **Rate limiting**: Add rate limiting for token generation
6. **Metrics**: Add monitoring and analytics

## References

- [LiveKit Documentation](https://docs.livekit.io/)
- [LiveKit Server SDK](https://docs.livekit.io/reference/server-sdk/)
- [LiveKit Cloud](https://cloud.livekit.io/)

## How to See Participants in LiveKit Dashboard

**Important**: Just generating a token doesn't create an active session. To see participants in your LiveKit dashboard, you need to actually **join a room** using the token.

### Option 1: Use the LiveKit Client (Recommended)

1. **Open the LiveKit Client**: Navigate to `http://localhost:3001/client`
2. **Enter Room Details**:
   - Room Name: `test-room-123` (or any name)
   - Your Name: `Alice` (or any name)
3. **Click "Join Room"**: This will:
   - Get a token from your server
   - Connect to the LiveKit room
   - Show you as an active participant
4. **Check Your Dashboard**: You should now see:
   - Active sessions in the LiveKit dashboard
   - Participants count > 0
   - Room activity

### Option 2: Use LiveKit Client SDKs

You can also use the generated tokens with:

- **Web**: LiveKit React components
- **Mobile**: LiveKit iOS/Android SDKs
- **Desktop**: LiveKit Electron SDK

### What You'll See in Dashboard

Once connected, your LiveKit dashboard will show:

- ✅ **Unique participants**: > 0
- ✅ **Total rooms**: > 0
- ✅ **Active sessions** with participant details
- ✅ **Real-time participant tracking**
