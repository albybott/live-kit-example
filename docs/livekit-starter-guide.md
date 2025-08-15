# LiveKit Node.js Starter Guide

## Build Your First AI Voice Chat Application

This guide will walk you through creating a simple but functional AI voice chat application using LiveKit Cloud and Node.js. By the end, you'll have a working voice AI agent that you can talk to in real-time.

## What We're Building

- **AI Voice Chat Interface**: Real-time voice conversation with an AI
- **Web-based Client**: Simple HTML page to test your voice agent
- **Node.js Backend**: Server to handle tokens and potentially AI logic
- **LiveKit Cloud**: Managed infrastructure (free tier)

---

## Step 1: Set Up LiveKit Cloud Account

### 1.1 Sign Up for LiveKit Cloud

1. **Go to [cloud.livekit.io](https://cloud.livekit.io)**
2. **Click "Sign Up"** and create your account
3. **Verify your email** when prompted
4. **Create your first project** - give it a meaningful name like "my-voice-ai"

### 1.2 Get Your API Credentials

1. **Navigate to your project dashboard**
2. **Go to Settings → Keys** in the sidebar
3. **Copy your credentials:**
   - **API Key** (starts with `APIxxx`)
   - **API Secret** (click to reveal, starts with `xxx`)
   - **WebSocket URL** (looks like `wss://yourproject-xxxxx.livekit.cloud`)

> 💡 **Note**: Keep these credentials secure! Never commit them to version control.

---

## Step 2: Set Up Your Development Environment

### 2.1 Prerequisites

Make sure you have these installed:

- **Node.js 18+** - [Download here](https://nodejs.org/)
- **Code editor** - VS Code, WebStorm, etc.
- **Modern web browser** - Chrome, Firefox, Safari, Edge

### 2.2 Create Project Directory

```bash
# Create and navigate to your project
mkdir livekit-voice-chat
cd livekit-voice-chat

# Initialize npm project
npm init -y

# Create project structure
mkdir public
mkdir src
touch .env
touch .gitignore
```

### 2.3 Install Dependencies

```bash
# Core LiveKit dependencies
npm install livekit-server-sdk @livekit/components-react livekit-client

# Express server dependencies
npm install express cors dotenv

# Development dependencies
npm install --save-dev nodemon concurrently
```

### 2.4 Configure Environment Variables

Create a `.env` file in your project root:

```bash
# LiveKit Cloud Credentials
LIVEKIT_API_KEY=your_api_key_here
LIVEKIT_API_SECRET=your_api_secret_here
LIVEKIT_URL=wss://yourproject-xxxxx.livekit.cloud

# Server Configuration
PORT=3001
NODE_ENV=development

# Optional: AI Service Keys (for future expansion)
# OPENAI_API_KEY=your_openai_key
# DEEPGRAM_API_KEY=your_deepgram_key
```

### 2.5 Configure .gitignore

```bash
# Add to .gitignore
.env
node_modules/
dist/
.DS_Store
*.log
```

---

## Step 3: Build the Node.js Backend

### 3.1 Create Token Generation Server

Create `src/server.js`:

```javascript
const express = require("express");
const cors = require("cors");
const { AccessToken } = require("livekit-server-sdk");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "LiveKit Token Server is running!" });
});

// Generate token endpoint
app.post("/api/token", async (req, res) => {
  try {
    const { roomName, participantName } = req.body;

    // Validate required fields
    if (!roomName || !participantName) {
      return res.status(400).json({
        error: "roomName and participantName are required",
      });
    }

    // Create access token
    const at = new AccessToken(
      process.env.LIVEKIT_API_KEY,
      process.env.LIVEKIT_API_SECRET,
      {
        identity: participantName,
        name: participantName,
      }
    );

    // Add room permissions
    at.addGrant({
      roomJoin: true,
      room: roomName,
      canPublish: true,
      canSubscribe: true,
      canUpdateOwnMetadata: true,
    });

    // Generate JWT token
    const token = await at.toJwt();

    console.log(
      `✅ Generated token for ${participantName} in room ${roomName}`
    );

    res.json({
      token,
      serverUrl: process.env.LIVEKIT_URL,
      roomName,
      participantName,
    });
  } catch (error) {
    console.error("❌ Token generation error:", error);
    res.status(500).json({
      error: "Failed to generate token",
      details: error.message,
    });
  }
});

// Room management endpoints
app.get("/api/rooms", async (req, res) => {
  try {
    // This would typically query your database
    // For now, we'll return a simple response
    res.json({
      message: "Room management coming soon!",
      availableRooms: ["voice-chat-demo", "ai-assistant-room"],
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 LiveKit Token Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 Web interface: http://localhost:${PORT}`);

  // Validate environment variables
  if (!process.env.LIVEKIT_API_KEY || !process.env.LIVEKIT_API_SECRET) {
    console.warn(
      "⚠️  Warning: LiveKit credentials not found in environment variables"
    );
  } else {
    console.log("✅ LiveKit credentials loaded successfully");
  }
});

module.exports = app;
```

### 3.2 Update package.json Scripts

Add these scripts to your `package.json`:

```json
{
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js",
    "test": "node -e \"console.log('Testing server...'); require('./src/server.js')\""
  }
}
```

---

## Step 4: Create the Web Client

### 4.1 Create HTML Interface

Create `public/index.html`:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>LiveKit Voice Chat Demo</title>
    <style>
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }

      body {
        font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .container {
        background: white;
        border-radius: 20px;
        padding: 2rem;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
        max-width: 500px;
        width: 90%;
        text-align: center;
      }

      h1 {
        color: #333;
        margin-bottom: 1rem;
        font-size: 2rem;
      }

      .subtitle {
        color: #666;
        margin-bottom: 2rem;
      }

      .form-group {
        margin-bottom: 1.5rem;
        text-align: left;
      }

      label {
        display: block;
        margin-bottom: 0.5rem;
        font-weight: 600;
        color: #333;
      }

      input {
        width: 100%;
        padding: 12px;
        border: 2px solid #e1e5e9;
        border-radius: 8px;
        font-size: 16px;
        transition: border-color 0.3s;
      }

      input:focus {
        outline: none;
        border-color: #667eea;
      }

      .btn {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border: none;
        padding: 15px 30px;
        border-radius: 8px;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
        transition: transform 0.2s;
        margin: 10px;
      }

      .btn:hover {
        transform: translateY(-2px);
      }

      .btn:disabled {
        background: #ccc;
        cursor: not-allowed;
        transform: none;
      }

      .status {
        margin-top: 1rem;
        padding: 10px;
        border-radius: 8px;
        font-weight: 600;
      }

      .status.connecting {
        background: #fff3cd;
        color: #856404;
      }

      .status.connected {
        background: #d4edda;
        color: #155724;
      }

      .status.error {
        background: #f8d7da;
        color: #721c24;
      }

      .video-container {
        margin-top: 2rem;
        display: none;
      }

      .local-video,
      .remote-video {
        width: 100%;
        max-width: 200px;
        height: 150px;
        background: #000;
        border-radius: 8px;
        margin: 10px;
      }

      .controls {
        margin-top: 1rem;
      }

      .controls button {
        margin: 5px;
      }

      .hidden {
        display: none;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <h1>🎙️ LiveKit Voice Chat</h1>
      <p class="subtitle">Connect and start a voice conversation</p>

      <!-- Connection Form -->
      <div id="connectionForm">
        <div class="form-group">
          <label for="roomName">Room Name</label>
          <input
            type="text"
            id="roomName"
            value="voice-chat-demo"
            placeholder="Enter room name"
          />
        </div>
        <div class="form-group">
          <label for="participantName">Your Name</label>
          <input
            type="text"
            id="participantName"
            value="User-"
            placeholder="Enter your name"
          />
        </div>
        <button class="btn" onclick="connectToRoom()">Join Room</button>
      </div>

      <!-- Room Interface -->
      <div id="roomInterface" class="hidden">
        <h3>Connected to Room</h3>
        <div class="video-container" id="videoContainer">
          <video
            id="localVideo"
            class="local-video"
            muted
            autoplay
            playsinline
          ></video>
          <video
            id="remoteVideo"
            class="remote-video"
            autoplay
            playsinline
          ></video>
        </div>

        <div class="controls">
          <button class="btn" id="micBtn" onclick="toggleMicrophone()">
            🎤 Mute
          </button>
          <button class="btn" id="cameraBtn" onclick="toggleCamera()">
            📹 Camera
          </button>
          <button class="btn" onclick="disconnectFromRoom()">❌ Leave</button>
        </div>
      </div>

      <div id="status" class="status hidden"></div>
    </div>

    <!-- LiveKit Client SDK -->
    <script src="https://cdn.jsdelivr.net/npm/livekit-client/dist/livekit-client.umd.min.js"></script>

    <script>
      // Generate random participant name
      document.getElementById("participantName").value =
        "User-" + Math.floor(Math.random() * 1000);

      let room = null;
      let isConnected = false;
      let isMicEnabled = true;
      let isCameraEnabled = false;

      // UI Helper Functions
      function showStatus(message, type = "info") {
        const statusEl = document.getElementById("status");
        statusEl.textContent = message;
        statusEl.className = `status ${type}`;
        statusEl.classList.remove("hidden");
      }

      function hideStatus() {
        document.getElementById("status").classList.add("hidden");
      }

      function showConnectionForm() {
        document.getElementById("connectionForm").classList.remove("hidden");
        document.getElementById("roomInterface").classList.add("hidden");
      }

      function showRoomInterface() {
        document.getElementById("connectionForm").classList.add("hidden");
        document.getElementById("roomInterface").classList.remove("hidden");
      }

      // LiveKit Connection Functions
      async function connectToRoom() {
        const roomName = document.getElementById("roomName").value.trim();
        const participantName = document
          .getElementById("participantName")
          .value.trim();

        if (!roomName || !participantName) {
          showStatus("Please enter both room name and your name", "error");
          return;
        }

        try {
          showStatus("Connecting to room...", "connecting");

          // Get token from server
          const response = await fetch("/api/token", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ roomName, participantName }),
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const { token, serverUrl } = await response.json();

          // Create and configure room
          room = new LivekitClient.Room({
            adaptiveStream: true,
            dynacast: true,
            videoCaptureDefaults: {
              resolution: LivekitClient.VideoPresets.h720.resolution,
            },
          });

          // Set up event listeners
          setupRoomEventListeners();

          // Connect to room
          await room.connect(serverUrl, token);

          // Enable microphone by default
          await room.localParticipant.setMicrophoneEnabled(true);

          showStatus("Connected successfully!", "connected");
          showRoomInterface();
          isConnected = true;

          console.log("✅ Connected to room:", roomName);
        } catch (error) {
          console.error("❌ Connection error:", error);
          showStatus(`Connection failed: ${error.message}`, "error");
        }
      }

      function setupRoomEventListeners() {
        // Handle new participants
        room.on(LivekitClient.RoomEvent.ParticipantConnected, (participant) => {
          console.log("👋 Participant connected:", participant.identity);
          showStatus(`${participant.identity} joined the room`, "info");
        });

        // Handle participants leaving
        room.on(
          LivekitClient.RoomEvent.ParticipantDisconnected,
          (participant) => {
            console.log("👋 Participant disconnected:", participant.identity);
            showStatus(`${participant.identity} left the room`, "info");
          }
        );

        // Handle track subscriptions (audio/video from others)
        room.on(
          LivekitClient.RoomEvent.TrackSubscribed,
          (track, publication, participant) => {
            console.log(
              "📺 Track subscribed:",
              track.kind,
              "from",
              participant.identity
            );

            if (track.kind === LivekitClient.Track.Kind.Audio) {
              // Audio track - attach to audio element or let it play automatically
              const audioElement = track.attach();
              document.body.appendChild(audioElement);
            } else if (track.kind === LivekitClient.Track.Kind.Video) {
              // Video track - attach to video element
              const videoElement = document.getElementById("remoteVideo");
              track.attach(videoElement);
              document.getElementById("videoContainer").style.display = "block";
            }
          }
        );

        // Handle track unsubscriptions
        room.on(
          LivekitClient.RoomEvent.TrackUnsubscribed,
          (track, publication, participant) => {
            track.detach();
          }
        );

        // Handle disconnection
        room.on(LivekitClient.RoomEvent.Disconnected, (reason) => {
          console.log("🔌 Disconnected from room:", reason);
          showStatus("Disconnected from room", "error");
          showConnectionForm();
          isConnected = false;
        });

        // Handle connection quality changes
        room.on(
          LivekitClient.RoomEvent.ConnectionQualityChanged,
          (quality, participant) => {
            console.log(
              "📊 Connection quality:",
              quality,
              "for",
              participant.identity
            );
          }
        );
      }

      async function toggleMicrophone() {
        if (!room || !isConnected) return;

        try {
          isMicEnabled = !isMicEnabled;
          await room.localParticipant.setMicrophoneEnabled(isMicEnabled);

          const micBtn = document.getElementById("micBtn");
          micBtn.textContent = isMicEnabled ? "🎤 Mute" : "🔇 Unmute";

          showStatus(
            isMicEnabled ? "Microphone enabled" : "Microphone muted",
            "info"
          );
        } catch (error) {
          console.error("❌ Microphone toggle error:", error);
          showStatus("Failed to toggle microphone", "error");
        }
      }

      async function toggleCamera() {
        if (!room || !isConnected) return;

        try {
          isCameraEnabled = !isCameraEnabled;
          await room.localParticipant.setCameraEnabled(isCameraEnabled);

          const cameraBtn = document.getElementById("cameraBtn");
          cameraBtn.textContent = isCameraEnabled
            ? "📹 Camera Off"
            : "📷 Camera On";

          if (isCameraEnabled) {
            // Attach local video track
            const localVideoTrack = room.localParticipant.getTrackPublication(
              LivekitClient.Track.Source.Camera
            )?.track;
            if (localVideoTrack) {
              const videoElement = document.getElementById("localVideo");
              localVideoTrack.attach(videoElement);
              document.getElementById("videoContainer").style.display = "block";
            }
          } else {
            // Detach local video track
            const localVideoTrack = room.localParticipant.getTrackPublication(
              LivekitClient.Track.Source.Camera
            )?.track;
            if (localVideoTrack) {
              localVideoTrack.detach();
            }
          }

          showStatus(
            isCameraEnabled ? "Camera enabled" : "Camera disabled",
            "info"
          );
        } catch (error) {
          console.error("❌ Camera toggle error:", error);
          showStatus("Failed to toggle camera", "error");
        }
      }

      async function disconnectFromRoom() {
        if (room && isConnected) {
          await room.disconnect();
          room = null;
          isConnected = false;
          showConnectionForm();
          hideStatus();
          console.log("👋 Disconnected from room");
        }
      }

      // Handle page unload
      window.addEventListener("beforeunload", () => {
        if (room && isConnected) {
          room.disconnect();
        }
      });

      // Auto-hide status messages after 3 seconds
      setInterval(() => {
        const statusEl = document.getElementById("status");
        if (
          !statusEl.classList.contains("hidden") &&
          !statusEl.classList.contains("connecting") &&
          !statusEl.classList.contains("connected")
        ) {
          hideStatus();
        }
      }, 3000);
    </script>
  </body>
</html>
```

---

## Step 5: Test Your Application

### 5.1 Start the Server

```bash
# Start in development mode with auto-reload
npm run dev

# Or start normally
npm start
```

You should see:

```
🚀 LiveKit Token Server running on port 3001
📊 Health check: http://localhost:3001/health
🔗 Web interface: http://localhost:3001
✅ LiveKit credentials loaded successfully
```

### 5.2 Test the Web Interface

1. **Open your browser** to `http://localhost:3001`
2. **Enter a room name** (e.g., "test-room")
3. **Enter your name** (auto-generated or custom)
4. **Click "Join Room"**
5. **Allow microphone access** when prompted

### 5.3 Test with Multiple Users

1. **Open a second browser tab** (or incognito window)
2. **Join the same room** with a different name
3. **You should hear each other speak!**

---

## Step 6: Add AI Voice Agent (Optional)

To make this a true AI voice chat, you can integrate with AI services. Here's a basic example:

### 6.1 Install Additional Dependencies

```bash
npm install openai @deepgram/sdk
```

### 6.2 Create Simple AI Agent

Create `src/ai-agent.js`:

```javascript
// This is a placeholder for AI integration
// You can integrate with OpenAI, Deepgram, ElevenLabs, etc.

class VoiceAIAgent {
  constructor() {
    this.isListening = false;
  }

  async processAudioInput(audioData) {
    // 1. Convert audio to text (Speech-to-Text)
    // 2. Send text to LLM (e.g., OpenAI)
    // 3. Convert response to speech (Text-to-Speech)
    // 4. Send audio back to room

    console.log("Processing audio input...");
    return "Hello! This is a placeholder AI response.";
  }

  startListening() {
    this.isListening = true;
    console.log("🤖 AI Agent started listening");
  }

  stopListening() {
    this.isListening = false;
    console.log("🤖 AI Agent stopped listening");
  }
}

module.exports = VoiceAIAgent;
```

---

## Step 7: Next Steps & Expansion Ideas

### 7.1 Immediate Improvements

1. **Add Error Handling**: Better error messages and recovery
2. **Improve UI**: More polished design and better mobile support
3. **Add Logging**: Server-side logging for debugging
4. **Environment Validation**: Check all required environment variables

### 7.2 AI Integration Options

1. **LiveKit Agents Framework**: Use the official AI agents framework
2. **OpenAI Integration**: Add GPT-4 for conversation
3. **Speech Services**: Integrate Deepgram, AssemblyAI, or Azure Speech
4. **Voice Synthesis**: Add ElevenLabs, OpenAI TTS, or Google TTS

### 7.3 Production Considerations

1. **Authentication**: Add user authentication
2. **Database**: Store room/user data
3. **Rate Limiting**: Prevent abuse
4. **HTTPS**: Use SSL certificates
5. **Monitoring**: Add application monitoring
6. **Scaling**: Handle multiple concurrent users

---

## Troubleshooting

### Common Issues

**❌ "Failed to generate token"**

- Check your `.env` file credentials
- Verify your LiveKit Cloud project is active
- Ensure API key and secret are correct

**❌ "Connection failed"**

- Check your WebSocket URL format
- Verify firewall isn't blocking WebRTC
- Try a different browser

**❌ "Microphone not working"**

- Check browser permissions
- Ensure HTTPS (required for microphone access)
- Try refreshing the page

**❌ "No audio from other participants"**

- Check browser audio permissions
- Verify other participant has microphone enabled
- Check browser console for errors

### Debug Tips

1. **Check browser console** for JavaScript errors
2. **Check server logs** for backend issues
3. **Verify environment variables** are loaded correctly
4. **Test with different browsers** to isolate issues

---

## Resources & Next Steps

### Official Documentation

- [LiveKit Docs](https://docs.livekit.io/)
- [LiveKit Node.js SDK](https://docs.livekit.io/reference/server-sdk-node/)
- [LiveKit Client SDK](https://docs.livekit.io/reference/client-sdk-js/)

### Community & Support

- [LiveKit Discord](https://livekit.io/discord)
- [GitHub Repository](https://github.com/livekit/livekit)
- [Example Projects](https://github.com/livekit/livekit-examples)

### Upgrade Paths

- **LiveKit Agents**: Official AI framework
- **React Integration**: Use LiveKit React components
- **Mobile Apps**: iOS/Android SDKs available
- **Advanced Features**: Screen sharing, recording, streaming

---

**🎉 Congratulations!** You now have a working LiveKit voice chat application. You can expand this foundation to build sophisticated AI voice agents, video conferencing apps, or real-time collaborative tools.

**Happy building! 🚀**
