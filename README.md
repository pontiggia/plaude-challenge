# Plaude - AI-Powered Slack Assistant

Plaude is a Next.js application that integrates with Slack to provide AI-powered assistance with human-in-the-loop approval workflows.

## Features

-   Slack OAuth integration for bot installation
-   AI chat interface powered by Anthropic Claude
-   Approval workflows that send requests to Slack for human approval
-   Redis-backed session and token storage

## Prerequisites (if setting up locally)

-   Node.js 18+
-   pnpm (recommended) or npm
-   Upstash Redis account (through vercel)
-   Slack workspace with admin permissions
-   Anthropic API key

## Quick Start

```bash
# Install dependencies
pnpm install

# Copy environment template
cp .env.local.example .env.local

# Configure environment variables (see below)

# Start development server
pnpm dev
```

## Environment Variables

Create a `.env.local` file with the following variables:

```bash
# Anthropic
ANTHROPIC_API_KEY=sk-ant-...

# Slack App (OAuth)
SLACK_CLIENT_ID=...
SLACK_CLIENT_SECRET=...
SLACK_SIGNING_SECRET=...

# Upstash Redis (for storing Slack tokens)
UPSTASH_REDIS_REST_URL=https://...upstash.io
UPSTASH_REDIS_REST_TOKEN=...

# App URLs
NEXT_PUBLIC_APP_URL=https://your-tunnel.trycloudflare.com
SLACK_REDIRECT_URL=https://your-tunnel.trycloudflare.com

# Session secret (generate with: openssl rand -base64 32)
SESSION_SECRET=...
```

## Local Development Setup

### 1. Set Up Cloudflare Tunnel

Slack OAuth requires HTTPS and a publicly accessible URL. Use Cloudflare Tunnel for local development (no account needed):

```bash
# Install cloudflared (macOS)
brew install cloudflared

# Start the tunnel (run this in a separate terminal)
cloudflared tunnel --url http://localhost:3000
```

This will output a URL like `https://random-words.trycloudflare.com`. Use this URL for:

-   `NEXT_PUBLIC_APP_URL` in `.env.local`
-   `SLACK_REDIRECT_URL` in `.env.local`
-   Slack App OAuth redirect URLs

**Note:** The tunnel URL changes each time you restart cloudflared. Update your Slack app and `.env.local` accordingly, or set up a permanent tunnel with a custom domain.

### 2. Set Up Upstash Redis

1. Go to [Upstash Console](https://console.upstash.com/)
2. Create a new Redis database
3. Copy the REST URL and REST Token to your `.env.local`:
    ```bash
    UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
    UPSTASH_REDIS_REST_TOKEN=xxx
    ```

### 3. Create a Slack App

1. Go to [Slack API Apps](https://api.slack.com/apps)
2. Click **Create New App** > **From scratch**
3. Enter an app name (e.g., "Plaude Dev") and select your workspace
4. Navigate to **OAuth & Permissions**

#### Configure OAuth Scopes

Under **Bot Token Scopes**, add:

-   `chat:write` - Send messages as the bot
-   `channels:read` - View basic channel info
-   `groups:read` - View private channels the bot is in
-   `users:read` - View users in the workspace
-   `channels:join` - Join public channels

#### Configure Redirect URLs

Under **OAuth & Permissions** > **Redirect URLs**, add:

```
https://your-tunnel.trycloudflare.com/api/slack/callback
```

Replace `your-tunnel.trycloudflare.com` with your actual Cloudflare tunnel URL.

#### Enable Interactivity

1. Navigate to **Interactivity & Shortcuts**
2. Turn on **Interactivity**
3. Set the Request URL to:
    ```
    https://your-tunnel.trycloudflare.com/api/slack/interactions
    ```

#### Get Credentials

1. Navigate to **Basic Information**
2. Copy the following to your `.env.local`:
    - **Client ID** → `SLACK_CLIENT_ID`
    - **Client Secret** → `SLACK_CLIENT_SECRET`
    - **Signing Secret** → `SLACK_SIGNING_SECRET`

### 4. Get Anthropic API Key

1. Go to [Anthropic Console](https://console.anthropic.com/)
2. Create an API key
3. Add it to `.env.local` as `ANTHROPIC_API_KEY`

### 5. Run the Application

```bash
# Terminal 1: Start Cloudflare tunnel
cloudflared tunnel --url http://localhost:3000

# Terminal 2: Start Next.js dev server
pnpm dev
```

Open your Cloudflare tunnel URL in the browser to access the app.

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── chat/          # Chat API endpoint
│   │   └── slack/
│   │       ├── oauth/     # Initiate Slack OAuth flow
│   │       ├── callback/  # OAuth callback handler
│   │       ├── channels/  # List available channels
│   │       ├── channel/   # Get/set selected channel
│   │       ├── disconnect/# Remove Slack integration
│   │       └── interactions/ # Handle Slack button clicks
│   ├── chat/              # Chat page
│   ├── setup/             # Setup/onboarding page
│   └── page.tsx           # Landing page
├── components/
│   ├── chat/              # Chat UI components
│   └── ui/                # Reusable UI components (shadcn)
├── lib/
│   ├── config.ts          # Environment configuration
│   ├── session.ts         # Session management
│   ├── db/
│   │   └── redis.ts       # Redis operations
│   └── slack/
│       ├── blocks.ts      # Slack Block Kit message builders
│       └── types.ts       # Slack type definitions
└── workflows/
    ├── agent/             # AI agent workflow
    └── approval/          # Approval workflow
```

## API Routes

| Route                     | Method   | Description                          |
| ------------------------- | -------- | ------------------------------------ |
| `/api/slack/oauth`        | GET      | Initiates Slack OAuth flow           |
| `/api/slack/callback`     | GET      | Handles OAuth callback from Slack    |
| `/api/slack/channels`     | GET      | Lists available Slack channels       |
| `/api/slack/channel`      | GET/POST | Get or set the selected channel      |
| `/api/slack/interactions` | POST     | Handles Slack interactive components |
| `/api/slack/disconnect`   | POST     | Removes Slack integration            |
| `/api/chat`               | POST     | Chat API endpoint                    |

## Troubleshooting

### "missing_scope" Error

If you see this error when trying to send messages to Slack, ensure your Slack app has the `channels:join` scope and you've reinstalled the app to your workspace.

### OAuth State Mismatch

Clear your browser cookies and try the OAuth flow again. This can happen if you restart the dev server or tunnel.

### Tunnel URL Changed

When your Cloudflare tunnel URL changes:

1. Update `.env.local` with the new URL
2. Update the Slack app redirect URL in the Slack API dashboard
3. Update the Slack app interactivity URL
4. Restart the dev server

### Redis Connection Issues

Verify your Upstash credentials are correct. The configuration logs on startup will show "SET" or "MISSING" for each credential.

## Scripts

```bash
pnpm dev      # Start development server
pnpm build    # Build for production
pnpm start    # Start production server
pnpm lint     # Run ESLint
```

## Tech Stack

-   **Framework:** Next.js 16 with App Router
-   **Language:** TypeScript
-   **Styling:** Tailwind CSS
-   **UI Components:** shadcn/ui (Radix UI)
-   **AI:** Anthropic Claude via AI SDK
-   **Use Workflows:** workflow/ai SDK
-   **Database:** Upstash Redis
-   **Slack:** @slack/web-api, @slack/bolt
