# Server Deployment Commands

Target server:

```bash
ssh root@87.106.89.20
```

## 1. Install packages

```bash
apt update
apt install -y git nginx mysql-server python3-venv python3-pip curl
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt install -y nodejs
npm install -g npm@latest
```

## 2. Create database

```bash
mysql
```

```sql
CREATE DATABASE IF NOT EXISTS logo_portal CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'logo_user'@'localhost' IDENTIFIED BY 'REPLACE_WITH_STRONG_PASSWORD';
GRANT ALL PRIVILEGES ON logo_portal.* TO 'logo_user'@'localhost';
FLUSH PRIVILEGES;
```

## 3. Clone and configure

```bash
mkdir -p /opt/logo_website
cd /opt
git clone https://github.com/DreamCCC/logo_website.git logo_website
cd /opt/logo_website
```

Create `backend/.env` from `backend/.env.example`, and `frontend/.env.local` from `frontend/.env.example`.

## 4. Backend setup

```bash
cd /opt/logo_website/backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python scripts/init_db.py
python scripts/seed.py
uvicorn app.main:app --host 127.0.0.1 --port 8000
```

## 5. Frontend setup

```bash
cd /opt/logo_website/frontend
npm install
npm run build
npm run start -- -H 127.0.0.1 -p 3000
```

## 6. Nginx target layout

```text
/        -> http://127.0.0.1:3000
/api     -> http://127.0.0.1:8000/api
/uploads -> http://127.0.0.1:8000/uploads
```

Systemd and Nginx configs will be added once the application runs successfully by port.
