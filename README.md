# Logo Website

Customer portal for illuminated logo and signage quote requests.

## Stack

- Frontend: Next.js, React, Tailwind CSS, framer-motion, lucide-react
- Backend: Python FastAPI
- Database: MySQL
- Auth: HttpOnly cookie + JWT
- Languages: English default, German optional

## Structure

```text
frontend/   Next.js UI
backend/    FastAPI API
database/   SQL schema
deploy/     server notes and deployment commands
docs/       product and technical requirements
```

## Frontend

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

## Backend

```bash
cd backend
cp .env.example .env
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python scripts/init_db.py
python scripts/seed.py
uvicorn app.main:app --reload
```

## API

- `GET /api/health`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `POST /api/quotes`
- `GET /api/quotes/my`
- `GET /api/content/products`
- `GET /api/content/gallery`

## Deployment

GitHub is used as the transfer point between local development and the Ubuntu server.
See `deploy/server-commands.md` for the current deployment checklist.

Do not commit real `.env` files, database passwords, JWT secrets or SSH private keys.
