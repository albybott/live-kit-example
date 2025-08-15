## LiveKit setup guide for this TypeScript project

This guide adapts the LiveKit starter to this repository's tooling (TypeScript, ESM, pnpm, tsx). You'll add a minimal token server that issues room tokens and a quick way to test it.

### What you'll build

- Token HTTP API (`POST /api/token`) that issues LiveKit JWTs
- Health endpoint (`GET /health`)
- Runs with `tsx` in dev, compiles with `tsc` for prod

### Prerequisites

- Node.js 18.17+ or 20+
- pnpm 8+
- LiveKit Cloud project with API Key/Secret and WebSocket URL

### 1) Install dependencies

```bash
pnpm add livekit-server-sdk express cors
pnpm add -D @types/express @types/cors
```

### 2) Add environment variables

Create (or update) `.env` in the project root:

```env
NODE_ENV=development
PORT=3001

# LiveKit Cloud credentials
LIVEKIT_API_KEY=APIxxxx
LIVEKIT_API_SECRET=xxxxxxxx
LIVEKIT_URL=wss://yourproject-xxxxx.livekit.cloud
```

Ensure `.env` is gitignored (this repo already ignores it via README instructions).

### 3) Create a minimal token server (TypeScript, ESM)

Create `src/livekit/server.ts`:

```ts
import "dotenv/config";
import express, { Request, Response } from "express";
import cors from "cors";
import { AccessToken } from "livekit-server-sdk";

interface TokenRequest {
  roomName?: string;
  participantName?: string;
}

const app = express();
const port = Number(process.env.PORT ?? 3001);

app.use(cors());
app.use(express.json());

app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", message: "LiveKit Token Server is running" });
});

app.post(
  "/api/token",
  async (req: Request<unknown, unknown, TokenRequest>, res: Response) => {
    try {
      const { roomName, participantName } = req.body ?? {};

      if (!roomName || !participantName) {
        return res
          .status(400)
          .json({ error: "roomName and participantName are required" });
      }

      const apiKey = process.env.LIVEKIT_API_KEY;
      const apiSecret = process.env.LIVEKIT_API_SECRET;
      const serverUrl = process.env.LIVEKIT_URL;

      if (!apiKey || !apiSecret || !serverUrl) {
        return res
          .status(500)
          .json({ error: "LiveKit credentials are not configured" });
      }

      const tokenBuilder = new AccessToken(apiKey, apiSecret, {
        identity: participantName,
        name: participantName,
      });

      tokenBuilder.addGrant({
        roomJoin: true,
        room: roomName,
        canPublish: true,
        canSubscribe: true,
        canUpdateOwnMetadata: true,
      });

      const token = await tokenBuilder.toJwt();

      res.json({ token, serverUrl, roomName, participantName });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      res
        .status(500)
        .json({ error: "Failed to generate token", details: message });
    }
  }
);

app.listen(port, () => {
  /* eslint-disable no-console */
  console.log(`🚀 LiveKit Token Server listening on http://localhost:${port}`);
  console.log(`📊 Health: http://localhost:${port}/health`);
  /* eslint-enable no-console */
});

export default app;
```

Notes:

- Uses this repo's ESM TypeScript setup (`module: ESNext`) and runs with `tsx`.
- Keeps the token server isolated in `src/livekit/` so the rest of your app in `src/index.ts` remains untouched.

### 4) Add convenient scripts

Update `package.json` scripts to include a dedicated LiveKit dev task:

```json
{
  "scripts": {
    "dev:livekit": "tsx --watch src/livekit/server.ts",
    "build:livekit": "tsc -p tsconfig.json"
  }
}
```

You can keep your existing scripts from the README. These additions are scoped to the LiveKit server file you just created.

### 5) Run and test

Start the token server:

```bash
pnpm dev:livekit
```

Verify it responds:

```bash
curl http://localhost:3001/health | jq
```

Request a token:

```bash
curl -X POST http://localhost:3001/api/token \
  -H "Content-Type: application/json" \
  -d '{"roomName":"voice-chat-demo","participantName":"User-123"}' | jq
```

Response includes a `token` and your `serverUrl` (the LiveKit Cloud WebSocket URL) that a client can use to join the room.

### 6) Optional: quick browser test page

If you want a basic test client, create `public/index.html` (not required for the server to work) and serve it with any static file server. You can adapt the HTML sample from the starter guide and point it at `POST /api/token` on `http://localhost:3001`.

### 7) Production build and start

Build the project as usual (this compiles all of `src/` including `src/livekit/server.ts`):

```bash
pnpm build
node dist/livekit/server.js
```

Or add a script:

```json
{
  "scripts": {
    "start:livekit": "node dist/livekit/server.js"
  }
}
```

### 8) Integration options

- Keep this LiveKit token server as an independent process (simplest).
- Or, integrate Express into your main `src/index.ts` application and mount the token route under your existing HTTP server. Suggested structure:
  - `src/services/livekit/tokenService.ts` – token creation logic
  - `src/controllers/livekitController.ts` – request validation + HTTP handler
  - `src/server/http.ts` – Express app wiring
  - Import/start from `src/index.ts`

### Troubleshooting

- Ensure `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET`, and `LIVEKIT_URL` are present and correct.
- Confirm your LiveKit Cloud project is active and the WebSocket URL matches your project.
- If the browser cannot access the microphone, serve over HTTPS in production.

### References

- See `README.md` for this repo's scripts and conventions (pnpm, tsx, ESM, strict TS).
- LiveKit docs: `https://docs.livekit.io/`
