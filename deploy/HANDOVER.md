# LumaSign Europe — 部署与交接说明

本文面向接手本 zip / 源码的同事：说明**当前线上环境**、如何**绑定自己的 Git 仓库**、以及日常如何**部署更新**。

- 站点：https://lumasign.eu  
- 服务器：`87.106.89.20`（SSH：`ssh root@87.106.89.20`）  
- 代码目录：`/root/mason-code/logo_website`  
- 本包对应线上 commit：`eb9649e`（以包内 `VERSION.txt` 为准，若有）

> **重要：** 服务器上的 `backend/.env`、`frontend/.env.local`、`.server-secrets` **不会**出现在 zip 里。线上环境变量已在服务器上配置好；交接时请向原开发者索取密钥清单或直接在服务器查看（勿提交到公开仓库）。

---

## 1. 架构一览

```text
浏览器
  └─ https://lumasign.eu  (Nginx + Let’s Encrypt)
        ├─ /           → 127.0.0.1:3000  (Next.js, logo-frontend)
        ├─ /api        → 127.0.0.1:8000  (FastAPI, logo-backend)
        └─ /uploads    → 127.0.0.1:8000

MySQL：127.0.0.1:3306 / 库名 logo_portal（仅本机，不对外）
```

| 组件 | systemd 服务 | 说明 |
|------|----------------|------|
| 后端 | `logo-backend` | FastAPI + uvicorn，工作目录 `backend/` |
| 前端 | `logo-frontend` | `npm run start`，工作目录 `frontend/` |
| 反代 | `nginx` | 站点配置：`/etc/nginx/sites-enabled/logo_website` |
| 证书 | certbot | `lumasign.eu`（非 www） |

常用状态命令：

```bash
systemctl status logo-backend logo-frontend nginx
curl -sS http://127.0.0.1:8000/api/health
```

---

## 2. 从 zip 接到自己的 GitHub（推荐）

外包交付的 zip **不含 `.git` 历史**时，按下面绑定客户自己的仓库。

### 2.1 在客户 GitHub 新建空仓库

例如：`https://github.com/<客户组织或账号>/logo_website.git`  
不要勾选自动生成 README（避免首次推送冲突）。

### 2.2 本机解压并首次推送

```bash
unzip logo_website-*.zip -d logo_website
cd logo_website

git init
git add .
git commit -m "Initial import from handover package (eb9649e)"
git branch -M main
git remote add origin https://github.com/<客户组织或账号>/logo_website.git
git push -u origin main
```

之后以**客户仓库**为唯一源码真相。

### 2.3 让服务器改用客户仓库（替换原外包个人仓库）

SSH 登录服务器后：

```bash
cd /root/mason-code/logo_website

# 查看当前远程（多半仍是原开发者个人仓库）
git remote -v

# 改成客户仓库
git remote set-url origin https://github.com/<客户组织或账号>/logo_website.git

# 首次拉取需可读权限：Deploy Key（推荐只读）或 HTTPS Token
git fetch origin
git checkout main
git reset --hard origin/main   # 确认与客户仓库一致后再执行
```

**权限建议：** 给服务器配置 GitHub **Deploy Key（只读）**，不要把个人账号密码写在服务器上。

### 2.4 若只想断开旧 Git、暂不绑新仓库

不影响网站运行（`.git` 不是运行时依赖）：

```bash
cd /root/mason-code/logo_website
git remote remove origin
# 或彻底移除版本库（以后只能用上传文件方式更新，一般不推荐）：
# rm -rf .git
```

---

## 3. 日常部署流程（服务器已绑定客户仓库后）

### 3.1 仅后端改动（如 Python / 邮件逻辑）

```bash
cd /root/mason-code/logo_website
git pull --ff-only origin main
systemctl restart logo-backend
systemctl status logo-backend --no-pager
journalctl -u logo-backend -n 50 --no-pager
```

### 3.2 有前端改动（React / Next / 静态资源）

```bash
cd /root/mason-code/logo_website
git pull --ff-only origin main

cd frontend
npm ci
npm run build
systemctl restart logo-frontend

# 若本次也改了后端：
systemctl restart logo-backend
```

### 3.3 后端依赖变更（`requirements.txt`）

```bash
cd /root/mason-code/logo_website/backend
source .venv/bin/activate
pip install -r requirements.txt
systemctl restart logo-backend
```

### 3.4 数据库结构变更

先备份，再执行项目内 SQL / 迁移脚本（若有）。当前库名：`logo_portal`。

```bash
# 示例备份
mysqldump logo_portal > /root/backup-logo_portal-$(date +%F).sql
```

---

## 4. 环境变量（钥匙在服务器，勿进 Git）

### 后端 `backend/.env`（线上已存在）

| 变量 | 用途 |
|------|------|
| `DATABASE_URL` | MySQL 连接（pymysql） |
| `JWT_SECRET` | 登录会话签名 |
| `FRONTEND_ORIGIN` | 线上为 `https://lumasign.eu` |
| `COOKIE_SECURE` | 线上为 `true` |
| `UPLOAD_DIR` | 上传目录绝对路径 |
| `SMTP_HOST` / `SMTP_PORT` | 当前 Strato：`smtp.strato.de` / `465` |
| `SMTP_USER` / `SMTP_PASSWORD` | 发信邮箱账号（如 `data@lumasign.eu`） |
| `SMTP_FROM` | 内部通知发件人 |
| `PROJECT_EMAIL` | 项目收件箱；客户确认信 From / Reply-To（如 `projects@lumasign.eu`） |
| `SMTP_ENABLED` | `true` / `false` |
| `ADMIN_EMAIL` / `ADMIN_INITIAL_PASSWORD` | 仅首次 seed 管理员时有用 |

模板见仓库内：`backend/.env.example`。

### 前端 `frontend/.env.local`

| 变量 | 线上建议 |
|------|----------|
| `NEXT_PUBLIC_API_BASE_URL` | `/api`（经 Nginx 同源反代） |

模板见：`frontend/.env.example`。

修改 `.env` 后需重启对应服务才会生效。

---

## 5. 邮件行为（交接后注意）

提交询价成功后：

1. **内部通知** → `PROJECT_EMAIL`（发件：`SMTP_FROM` / `SMTP_USER`）  
2. 若客户在表单联系方式里填了合法邮箱 → **客户确认信**（发件显示为 `PROJECT_EMAIL`，SMTP 登录该邮箱；密码与 `SMTP_PASSWORD` 相同的前提下可工作）

邮箱密码变更后，同步更新服务器 `backend/.env` 并 `systemctl restart logo-backend`。

---

## 6. 管理后台

- 地址：https://lumasign.eu/login → `/admin`  
- 管理员账号在数据库中；初始邮箱默认常见为 `admin@ks-logo.de`（以线上实际为准）  
- **交接后请立即修改管理员密码**

---

## 7. 目录与勿删清单

```text
/root/mason-code/logo_website/
  backend/          # FastAPI，含 .venv、.env、uploads
  frontend/         # Next.js，含 .next 构建产物、.env.local
  deploy/           # 部署相关文档
  database/         # schema 等
  .server-secrets   # 若存在：权限应为 600，勿提交、勿公开
```

**不要删除：** `backend/.env`、`frontend/.env.local`、`backend/uploads/`、`backend/.venv/`、`frontend/node_modules/`（可用 `npm ci` 重建）、systemd unit、Nginx / Let’s Encrypt 证书。

**可以删除或断开：** 仅 `.git` 远程或整个 `.git`（不影响当前已在跑的进程）。

---

## 8. 本机开发（可选）

```bash
# 后端
cd backend
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # 按本机 MySQL 修改
uvicorn app.main:app --reload --port 8000

# 前端
cd frontend
npm ci
cp .env.example .env.local
npm run dev
```

---

## 9. 交接验收清单

- [ ] 客户已拥有完整 zip，且 commit / `VERSION.txt` 与线上一致  
- [ ] 客户 GitHub 已导入代码并完成首次 push  
- [ ] 服务器 `git remote` 已改为客户仓库（或已明确断开旧仓库）  
- [ ] 客户可 SSH 登录；原外包公钥已从 `authorized_keys` 移除（约定保修期除外）  
- [ ] 已交接：域名 DNS、邮箱密码、DB 密码、`JWT_SECRET`、Admin 账号  
- [ ] `https://lumasign.eu` 与 `/api/health` 正常  
- [ ] 测试提交一笔询价，确认内部邮件与客户确认信  

---

## 10. 相关文件

| 文件 | 说明 |
|------|------|
| `deploy/server-commands.md` | 早期从零安装备忘（新机参考） |
| `docs/04-基础设施与部署.md` | 基础设施背景 |
| `docs/07-前端网站介绍与使用说明.md` | 产品与使用说明 |
| `backend/.env.example` / `frontend/.env.example` | 环境变量模板 |

如有疑问，以**服务器上正在运行的配置与 systemd unit**为准。
