# AI Customer Support Agent

Minimal full-stack AI customer support chat app: JWT auth, MongoDB-backed chat history, OpenRouter-powered AI replies.

## Structure

- `client/` — React (Vite) frontend
- `server/` — Node.js + Express backend

## Run with Docker (recommended)

1. Copy env files:
   ```
   cp server/.env.example server/.env
   ```
   Fill in `JWT_SECRET` (any long random string) and `OPENROUTER_API_KEY` (get a free key at https://openrouter.ai/keys).
2. Start everything:
   ```
   docker compose up --build
   ```
3. Open http://localhost:4173 (frontend). API runs on http://localhost:5000.

## Run locally without Docker

**Server**
```
cd server
cp .env.example .env   # fill in JWT_SECRET and OPENROUTER_API_KEY
# set MONGO_URI to a local Mongo instance or an Atlas connection string
npm install
npm run dev
```

**Client**
```
cd client
cp .env.example .env
npm install
npm run dev
```
Visit http://localhost:5173.

## Deploy (Render)

This repo includes a `render.yaml` Blueprint that sets up both services.

1. Create a free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) cluster and copy its connection string.
2. In the [Render dashboard](https://dashboard.render.com), click **New + → Blueprint** and connect this GitHub repo.
3. Render reads `render.yaml` and creates two services:
   - `ai-support-agent-server` (Docker web service)
   - `ai-support-agent-client` (static site)
4. When prompted, fill in the server's env vars: `OPENROUTER_API_KEY` and `MONGO_URI` (your Atlas string). `JWT_SECRET` is generated automatically.
5. Once the server deploys, copy its URL (e.g. `https://ai-support-agent-server.onrender.com`), set it as the client service's `VITE_API_URL` env var, then trigger a manual redeploy of the client (it's baked in at build time).
6. Open the client service's URL — that's your deployed link.

## API

| Route | Method | Auth | Description |
|---|---|---|---|
| `/auth/signup` | POST | — | `{ email, password }` → creates user, returns JWT |
| `/auth/login` | POST | — | `{ email, password }` → returns JWT |
| `/auth/logout` | POST | — | No-op (stateless JWT); client discards token |
| `/chat/send` | POST | Bearer token | `{ message }` → AI reply, saved to history |
| `/chat/history` | GET | Bearer token | Returns the user's past messages |

## Notes

- Passwords are hashed with bcrypt; JWT expires after 7 days.
- `/chat/send` is rate-limited to 20 requests/minute per logged-in user.
- Without `OPENROUTER_API_KEY` set, `/chat/send` returns a placeholder reply so the rest of the app still works.
