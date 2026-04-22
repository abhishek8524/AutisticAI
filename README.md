# AutisticAI (SensorySafe Map)

AutisticAI is a full-stack web platform designed to help autistic and sensory-sensitive people discover places that feel safer and more comfortable before visiting.

The app combines community feedback, sensory-focused scoring, and AI-assisted review analysis to show how environments may feel in terms of noise, lighting, crowd levels, and common triggers.

## What This Project Does

- Shows places on an interactive map with sensory context
- Lets users submit sensory reviews for locations
- Builds location rankings (best/worst sensory comfort)
- Supports personalized recommendations from user sensory profiles
- Uses AI to extract sensory signals from written reviews

## Core Features

- **Interactive map explorer** for sensory-rated places
- **Location detail views** with score breakdowns and community feedback
- **Sensory profile management** for personalized comfort filtering
- **Rankings page** for top/bottom sensory-friendly locations
- **Auth0 authentication** for logged-in user features
- **AI analysis pipeline** (Gemini) for review signal extraction
- **Media upload support** via Cloudinary

## Tech Stack

### Frontend

- React + Vite
- React Router
- Deck.gl + Mapbox GL
- Auth0 React SDK
- Axios
- Recharts

### Backend

- Node.js + Express
- Prisma ORM
- PostgreSQL
- Auth0 JWT validation middleware
- Google Places API integration
- Google Gemini API integration
- Cloudinary uploads

## Repository Structure

```text
AutisticAI/
├── frontend/        # React + Vite client
├── backend/         # Express API + Prisma
├── Log-in user/     # Assets/docs for logged-in flow
├── Non-login User/  # Assets/docs for non-login flow
└── About_functionality.text
```

## Prerequisites

- Node.js 20+
- npm 10+
- PostgreSQL database
- Auth0 application + API
- Mapbox token
- Google Places API key
- Google Gemini API key
- Cloudinary account (for image uploads)

## Environment Variables

Create these files:

- `backend/.env`
- `frontend/.env`

### `backend/.env`

```env
PORT=3000
DATABASE_URL=postgresql://<user>:<password>@<host>:<port>/<db>?sslmode=require

AUTH0_ISSUER_BASE_URL=https://<your-auth0-domain>/
AUTH0_AUDIENCE=<your-auth0-api-audience>

GOOGLE_PLACES_KEY=<google-places-api-key>
GEMINI_API_KEY=<google-gemini-api-key>

CLOUDINARY_CLOUD_NAME=<cloudinary-cloud-name>
CLOUDINARY_API_KEY=<cloudinary-api-key>
CLOUDINARY_API_SECRET=<cloudinary-api-secret>
ALLOWED_ORIGINS=https://<your-netlify-site>.netlify.app
```

### `frontend/.env`

```env
VITE_API_URL=http://localhost:3000
VITE_AUTH0_DOMAIN=<your-auth0-domain>
VITE_AUTH0_CLIENT_ID=<your-auth0-client-id>
VITE_AUTH0_AUDIENCE=<your-auth0-api-audience>
VITE_MAPBOX_TOKEN=<your-mapbox-token>
```

## Local Development

Install dependencies:

```bash
cd backend && npm install
cd ../frontend && npm install
```

Generate Prisma client and run migrations:

```bash
cd backend
npx prisma generate
npx prisma migrate deploy
```

Optional: seed database:

```bash
npm run seed
```

Start backend:

```bash
cd backend
npm run dev
```

Start frontend:

```bash
cd frontend
npm run dev
```

App URLs:

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:3000`

## Scripts

### Backend (`backend/package.json`)

- `npm run dev` - start API in watch mode (nodemon)
- `npm start` - start API in production mode
- `npm run seed` - populate places/reviews/scores

### Frontend (`frontend/package.json`)

- `npm run dev` - start Vite dev server
- `npm run build` - production build
- `npm run preview` - preview built app
- `npm run lint` - run ESLint

## API Overview

Backend routes are under `backend/src/routes/` and cover:

- auth + user sync
- locations and discovery
- reviews and rankings
- profiles and saved places
- AI analysis and uploads

## Deployment Notes

- Deploy frontend and backend as separate services
- Use a managed PostgreSQL instance
- Set all environment variables in deployment platforms (do not commit `.env`)
- Ensure CORS and Auth0 allowed callback/origin URLs match deployed domains
- Run `prisma generate` and `prisma migrate deploy` in backend deploy flow

## Deploy: Netlify (Frontend) + Render (Backend)

### 1) Deploy backend to Render

- Create a new **Web Service** from this repository
- Render detects `render.yaml` at repo root
- Service uses:
  - `rootDir`: `backend`
  - Build command: `npm install && npx prisma generate && npx prisma migrate deploy`
  - Start command: `npm start`

Set Render environment variables:

- `PORT=3000` (optional, Render provides one automatically)
- `DATABASE_URL`
- `AUTH0_ISSUER_BASE_URL`
- `AUTH0_AUDIENCE`
- `GOOGLE_PLACES_KEY`
- `GEMINI_API_KEY`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `ALLOWED_ORIGINS=https://<your-netlify-site>.netlify.app`

After deploy, copy your backend URL, for example:

`https://autisticai-backend.onrender.com`

### 2) Deploy frontend to Netlify

- Create a new site from this repository
- Netlify detects `netlify.toml` at repo root
- Frontend build config:
  - Base directory: `frontend`
  - Build command: `npm run build`
  - Publish directory: `frontend/dist`

Set Netlify environment variables:

- `VITE_API_URL=https://<your-render-backend>.onrender.com`
- `VITE_AUTH0_DOMAIN`
- `VITE_AUTH0_CLIENT_ID`
- `VITE_AUTH0_AUDIENCE`
- `VITE_MAPBOX_TOKEN`

### 3) Final auth/cors checks

- In Auth0 Allowed Callback URLs, add your Netlify URL
- In Auth0 Allowed Logout URLs, add your Netlify URL
- In Auth0 Allowed Web Origins, add your Netlify URL
- Confirm `ALLOWED_ORIGINS` on Render exactly matches your Netlify domain

## Accessibility and Product Goal

The goal is not only map discovery, but practical sensory support:

- reduce uncertainty before visiting places
- improve confidence for neurodivergent users and families
- encourage community-driven sensory transparency

## License

This repository currently has no explicit LICENSE file. Add one before commercial redistribution.
