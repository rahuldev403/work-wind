# StreetGuard AI

StreetGuard AI is a real-time community safety platform where users can report incidents, get nearby alerts, and view AI-classified risk updates.

## Landing Page Screenshot

![StreetGuard AI Landing Page](client/public/hero.png)

## What It Does

- User authentication with email OTP verification and secure cookie-based sessions.
- Incident reporting with title, description, location, and optional media upload.
- AI-powered categorization of incidents by type and severity.
- Real-time incident broadcast using Socket.IO.
- Interactive incident feed with filters, map view, and upvotes.

## Project Structure

- `client/` - React + Vite frontend
- `server/` - Node.js + Express backend API

## Tech Stack

- Frontend: React, Vite, Tailwind CSS, Zustand, Axios, React Router, Leaflet, Socket.IO client
- Backend: Node.js, Express, MongoDB (Mongoose), JWT, Socket.IO, Cloudinary, Nodemailer
- AI: Mistral API for incident classification/summarization

## Quick Start

### 1) Install dependencies

```bash
cd server && npm install
cd ../client && npm install
```

### 2) Create environment files

Create a `.env` file in `server/`:

```env
PORT=8000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

MONGO_URL=your_mongodb_connection_string

JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret

EMAIL_USER=your_email_user
EMAIL_PASSWORD=your_email_password

MISTRAL_API_KEY=your_mistral_api_key
MISTRAL_MODEL=mistral-large-latest

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

Create a `.env` file in `client/`:

```env
VITE_API_URL=http://localhost:8000
```

### 3) Run the app

Backend:

```bash
cd server
npm run dev
```

Frontend (new terminal):

```bash
cd client
npm run dev
```

Client runs on `http://localhost:5173` and server runs on `http://localhost:8000` by default.

## Main Routes

Frontend:

- `/` - Landing page
- `/feed` - Protected real-time incident feed
- `/report` - Protected incident reporting page

Backend:

- `POST /api/auth/signup`
- `POST /api/auth/verify-registration`
- `POST /api/auth/signin`
- `POST /api/auth/refresh`
- `POST /api/auth/signout`
- `GET /api/auth/me`
- `POST /api/incidents`
- `POST /api/incidents/upload`
- `GET /api/incidents`
- `GET /api/incidents/:id`
- `PATCH /api/incidents/:id/upvote`

## Notes

- Auth uses HTTP-only cookies (`accessToken` + `refreshToken`).
- CORS origin must match `CLIENT_URL`.
- Cloudinary is required for media uploads.
- Mistral API key is required for AI classification.
