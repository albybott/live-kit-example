# LiveKit Implementation Guide

This document describes the LiveKit implementation in this project.

## Overview

The LiveKit implementation provides a token server that issues JWT tokens for LiveKit Cloud rooms. It's designed to work with the existing TypeScript/ESM project structure.

## Architecture

- **Token Server**: Express.js server that generates LiveKit JWT tokens
- **API Endpoints**:
  - `GET /` - Web interface for testing
  - `GET /health` - Health check endpoint
  - `POST /api/token` - Token generation endpoint
- **Integrated Web Interface**: HTML page served directly from the LiveKit server

## Files Structure

```
src/
├── livekit/
│   └── server.ts          # LiveKit token server with integrated web interface
public/
└── index.html             # Test page for the token server
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
