import "dotenv/config";
import express, { Application, Request, Response } from "express";
import cors from "cors";
import { AccessToken } from "livekit-server-sdk";
import { readFile } from "fs/promises";
import { join } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = fileURLToPath(new URL(".", import.meta.url));

interface TokenRequest {
  roomName?: string;
  participantName?: string;
}

const app: Application = express();
const port = Number(process.env.PORT ?? 3001);

app.use(cors());
app.use(express.json());

// Serve static HTML file
app.get("/", async (_req: Request, res: Response) => {
  try {
    const htmlPath = join(__dirname, "../../public/index.html");
    const htmlContent = await readFile(htmlPath, "utf-8");
    res.setHeader("Content-Type", "text/html");
    res.send(htmlContent);
  } catch (error) {
    res.status(500).send("<h1>Error loading HTML file</h1>");
  }
});

app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", message: "LiveKit Token Server is running" });
});

app.post(
  "/api/token",
  async (
    req: Request<unknown, unknown, TokenRequest>,
    res: Response
  ): Promise<void> => {
    try {
      const { roomName, participantName } = req.body ?? {};

      if (!roomName || !participantName) {
        res
          .status(400)
          .json({ error: "roomName and participantName are required" });
        return;
      }

      const apiKey = process.env.LIVEKIT_API_KEY;
      const apiSecret = process.env.LIVEKIT_API_SECRET;
      const serverUrl = process.env.LIVEKIT_URL;

      if (!apiKey || !apiSecret || !serverUrl) {
        res
          .status(500)
          .json({ error: "LiveKit credentials are not configured" });
        return;
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
  console.log(`🌐 Web Interface: http://localhost:${port}/`);
  /* eslint-enable no-console */
});

export default app;
