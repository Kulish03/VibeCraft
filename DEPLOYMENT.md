# 🚀 VIBECRAFT End-to-End Production Deployment Guide

This guide provides step-by-step instructions for deploying the **VIBECRAFT** AI Code Review Assistant publicly to the internet using:
- **Frontend**: [Vercel](https://vercel.com) (React 18 + Vite SPA)
- **Backend**: [Render](https://render.com) (Node.js 20 + Express API)
- **Database**: [MongoDB Atlas](https://www.mongodb.com/atlas) (M0 Cloud Cluster)
- **AI Runtime**: [Ollama](https://ollama.ai) (Local GPU + Cloudflare Tunnel or Cloud VPS)

---

## 🏗 Deployment Architecture

```
   ┌────────────────────────────────────────┐
   │             Developer / User           │
   └───────────────────┬────────────────────┘
                       │ HTTPS
                       ▼
       ┌───────────────────────────────┐
       │   Vercel Edge Network (SPA)   │
       │   https://vibecraft.vercel.app│
       └───────────────┬───────────────┘
                       │ REST API (HTTPS)
                       ▼
       ┌───────────────────────────────┐
       │     Render Web Service        │
       │ https://vibecraft.onrender.com│
       └───────┬───────────────┬───────┘
               │               │
  Mongoose TLS │               │ HTTPS (Bearer Auth)
               ▼               ▼
     ┌──────────────────┐    ┌─────────────────────────────────┐
     │  MongoDB Atlas   │    │  Remote Ollama Server           │
     │  (Cloud Cluster) │    │  (Cloudflare Tunnel / Cloud VPS)│
     └──────────────────┘    └─────────────────────────────────┘
```

---

## 📋 Prerequisites
Before starting, ensure you have:
1. A [GitHub](https://github.com) account.
2. A [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) account.
3. A [Render](https://render.com) account.
4. A [Vercel](https://vercel.com) account.
5. Ollama installed on a machine with a GPU or a cloud VM.

---

## 🗄 Step 1: Deploy MongoDB Atlas (Database)

1. **Create an Account & Cluster**:
   - Sign in to [MongoDB Atlas](https://cloud.mongodb.com).
   - Click **Create Deployment** and choose **M0 (Free Shared)**.
   - Select a cloud provider (AWS or GCP) and a region geographically close to your users (e.g., `us-east-1` or `eu-central-1`).
   - Cluster Name: `vibecraft-cluster`.
   - Click **Create**.

2. **Configure Database Access (Credentials)**:
   - Navigate to **Security** > **Database Access** in the left sidebar.
   - Click **Add New Database User**.
   - Authentication Method: **Password**.
   - Username: `vibecraft_admin`.
   - Password: Click **Autogenerate Secure Password** or enter an alphanumeric password (avoid special characters like `@`, `:`, `#`, `%` to prevent URI parsing errors).
   - Database User Privileges: Select **Read and write to any database** (or restrict to `ai_code_reviewer`).
   - Click **Add User**.

3. **Configure Network Access (IP Whitelist)**:
   - In the left sidebar, click **Security** > **Network Access**.
   - Click **Add IP Address**.
   - Select **Allow Access From Anywhere** (`0.0.0.0/0`).
   - *Why? Render uses dynamic outbound IP addresses that change frequently. MongoDB Atlas requires `0.0.0.0/0` so Render can establish connections.*
   - Click **Confirm**.

4. **Obtain Connection String**:
   - Go to **Database** > click **Connect** on your cluster.
   - Select **Drivers** (Node.js).
   - Copy the connection string format:
     ```text
     mongodb+srv://vibecraft_admin:<password>@vibecraft-cluster.xxxx.mongodb.net/ai_code_reviewer?retryWrites=true&w=majority
     ```
   - Replace `<password>` with your database user password.
   - Save this connection string securely for Step 4.

---

## 🦙 Step 2: Deploy & Host Ollama Remotely

Render runs in the cloud and cannot reach `localhost:11434` on your computer. Choose one of the following methods to host Ollama remotely.

### Option A: Local PC GPU + Cloudflare Tunnel (Recommended, Zero Cost)
If you have a laptop or desktop with an NVIDIA/Apple Silicon GPU, you can expose Ollama securely via a free Cloudflare Tunnel.

1. **Start Ollama Locally**:
   ```bash
   ollama serve
   ollama pull qwen2.5-coder:7b
   ```
2. **Install Cloudflared**:
   - **Windows**: `winget install --id Cloudflare.cloudflared`
   - **macOS**: `brew install cloudflared`
   - **Linux**: `curl -fsSL https://pkg.cloudflare.com/cloudflared-ascii.repo | sudo tee /etc/yum.repos.d/cloudflared.repo && sudo dnf install cloudflared`
3. **Launch the Public Tunnel**:
   ```bash
   cloudflared tunnel --url http://localhost:11434
   ```
4. **Copy the Generated Public URL**:
   Cloudflare outputs a URL such as:
   ```text
   https://random-words-xxxx.trycloudflare.com
   ```
5. *(Optional Security)* If running a persistent tunnel with Cloudflare Zero Trust, configure an Access Service Token and save the token as `OLLAMA_API_KEY`.

---

### Option B: Cloud GPU VPS (RunPod, Modal, or Cloud VM)
1. Launch a cloud instance with GPU (e.g., RunPod, Modal, AWS G4dn, or DigitalOcean Droplet).
2. Install Ollama and pull the model:
   ```bash
   curl -fsSL https://ollama.com/install.sh | sh
   ollama serve &
   ollama pull qwen2.5-coder:7b
   ```
3. Set up a reverse proxy (Caddy or Nginx) to enforce HTTPS and Bearer Token authentication so port 11434 is never publicly exposed unprotected:
   ```caddy
   # /etc/caddy/Caddyfile
   your-gpu-domain.com {
       @authorized header Authorization "Bearer your_super_secure_ollama_key_2026"
       handle @authorized {
           reverse_proxy localhost:11434
       }
       handle {
           respond "Unauthorized" 401
       }
   }
   ```
4. Note your HTTPS URL (`https://your-gpu-domain.com`) and token (`your_super_secure_ollama_key_2026`).

---

## 📦 Step 3: Push Code to GitHub

1. Ensure you are in the project root directory:
   ```bash
   cd C:\Users\kulis\.gemini\antigravity\scratch\ai-code-reviewer
   ```
2. Initialize Git:
   ```bash
   git init
   git add .
   ```
3. Verify that sensitive `.env` files are **NOT** staged:
   ```bash
   git status
   ```
   *(Ensure `backend/.env` is ignored by `.gitignore`)*.
4. Commit and push:
   ```bash
   git commit -m "feat: complete VIBECRAFT production configuration"
   git branch -M main
   git remote add origin https://github.com/<your-username>/vibecraft.git
   git push -u origin main
   ```

---

## ⚙️ Step 4: Deploy Backend on Render

1. **Create Web Service**:
   - Log in to the [Render Dashboard](https://dashboard.render.com).
   - Click **New +** > **Web Service**.
   - Select **Build and deploy from a Git repository** > click **Next**.
   - Connect your GitHub account and select the `vibecraft` repository.

2. **Configure Service Settings**:
   - **Name**: `vibecraft-api` (or custom name)
   - **Region**: Choose the region closest to your MongoDB Atlas cluster (e.g., Oregon or Frankfurt).
   - **Branch**: `main`
   - **Root Directory**: `backend` *(CRITICAL: Must be set to backend)*
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: `Free`

3. **Configure Environment Variables**:
   Under **Environment Variables**, add the following key-value pairs:

   | Key | Value | Description |
   |---|---|---|
   | `NODE_ENV` | `production` | Enables production optimizations & error masking |
   | `PORT` | `10000` | (Render assigns this automatically, or set explicitly) |
   | `MONGODB_URI` | `mongodb+srv://...` | Your MongoDB Atlas connection string from Step 1 |
   | `JWT_SECRET` | `generate_32_char_hex` | Long random secret for signing JWTs |
   | `JWT_EXPIRES_IN` | `7d` | Token lifetime |
   | `CLIENT_URL` | `https://vibecraft.vercel.app` | Vercel domain (update once frontend is deployed) |
   | `OLLAMA_BASE_URL` | `https://...` | Public Ollama URL from Step 2 |
   | `OLLAMA_MODEL` | `qwen2.5-coder:7b` | Model name |
   | `OLLAMA_TIMEOUT_MS`| `180000` | 3 minutes for local LLM inference |
   | `OLLAMA_API_KEY` | *(Optional)* | Bearer token if remote Ollama is protected |

4. **Configure Health Check Path**:
   - Click **Advanced** > set **Health Check Path** to `/api/health`.

5. **Deploy & Verify**:
   - Click **Create Web Service**.
   - Wait for the build logs to show `AI Code Review Assistant Backend Server Running`.
   - Copy your Render backend URL:
     ```text
     https://vibecraft-api.onrender.com
     ```
   - Test the health check endpoint in your browser:
     ```text
     https://vibecraft-api.onrender.com/api/health
     ```
     You should receive `status: "healthy"` and `database.status: "connected"`.

---

## ⚡ Step 5: Deploy Frontend on Vercel

1. **Import Project**:
   - Log in to [Vercel](https://vercel.com).
   - Click **Add New...** > **Project**.
   - Connect to GitHub and select the `vibecraft` repository.

2. **Configure Project Settings**:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click **Edit** and select `frontend` *(CRITICAL: Must point to frontend)*.
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install --legacy-peer-deps`

3. **Configure Environment Variables**:
   - Expand the **Environment Variables** section.
   - Add:
     - **Key**: `VITE_API_URL`
     - **Value**: `https://vibecraft-api.onrender.com/api` *(Your Render backend URL with /api suffix)*

4. **Deploy**:
   - Click **Deploy**.
   - Vercel will install dependencies, compile the SPA, and deploy globally to its edge network in ~45 seconds.
   - Once deployed, copy your production frontend URL (e.g., `https://vibecraft.vercel.app`).

5. **Update Backend CORS (Final Handshake)**:
   - Return to your [Render Dashboard](https://dashboard.render.com) > `vibecraft-api` > **Environment**.
   - Verify `CLIENT_URL` is set to your exact Vercel frontend URL:
     ```text
     CLIENT_URL=https://vibecraft.vercel.app
     ```
   - Render will automatically re-deploy with the updated CORS policy.

---

## ✅ Step 6: End-to-End Verification Checklist

Verify all functionality in your deployed production environment:

| Feature | Verification Step | Expected Outcome |
|---|---|---|
| **Public UI Accessibility** | Visit `https://vibecraft.vercel.app` | Pristine light theme landing page loads with smooth Framer Motion animations. |
| **SPA Route Refresh** | Navigate to `/login`, `/dashboard`, or `/history` and press `F5` (browser reload) | Page renders smoothly with zero 404 errors (verified by `vercel.json`). |
| **User Registration** | Register a new account on `/register` | HTTP 201 Created; user document saved in MongoDB Atlas; JWT stored in `localStorage`. |
| **Authentication & Me** | Log out and log back in on `/login` | Token verified; user redirected to `/dashboard`. |
| **AI Code Review** | Submit sample Python or C++ code on `/reviews` | Backend validates input, forwards to remote Ollama engine, and renders the 7-section structured analysis dashboard. |
| **Contextual AI Chat** | In the review drawer, ask *"How can I optimize this algorithm?"* | Ollama returns in-context educational debugging suggestions. |
| **Code Comparison** | Submit revised code and click **Compare Versions** | Visual diff calculates score delta ($\Delta$), new issues, and resolved bugs. |
| **Review History** | Visit `/history` and filter by language and mode | Past reviews fetched from MongoDB Atlas with pagination and search filtering. |

---

## 🔧 Troubleshooting Common Production Issues

### 1. `Blocked by CORS policy` in Browser Console
- **Cause**: The origin in the browser (`https://vibecraft.vercel.app`) is not recognized by Render's `CLIENT_URL`.
- **Fix**: In the Render dashboard, ensure `CLIENT_URL` matches your Vercel URL exactly (e.g. `https://vibecraft.vercel.app` without a trailing slash). Vercel preview domains (`https://*-your-team.vercel.app`) are automatically permitted.

### 2. Render Free Tier Spin-Down Delay
- **Behavior**: Render free instances automatically spin down after 15 minutes of inactivity. The first incoming request may take 30–50 seconds to wake up the service.
- **Solution**: The frontend Axios client is configured with a 120-second timeout, ensuring requests do not drop during cold starts.

### 3. `MongooseServerSelectionError: Could not connect to any servers in your MongoDB Atlas cluster`
- **Cause**: IP whitelist does not allow Render's dynamic IP address, or password contains unencoded special characters.
- **Fix**: In MongoDB Atlas **Network Access**, ensure `0.0.0.0/0` is present. In your connection string, verify the password does not contain bare characters like `@` or `#` (use URL-encoding or an alphanumeric password).

### 4. `Ollama runtime offline at https://...`
- **Cause**: Cloudflare Tunnel was closed, or remote Ollama VPS stopped.
- **Fix**: Verify your tunnel status (`cloudflared tunnel`) or check `curl https://your-ollama-url/api/tags`. The backend health check endpoint (`/api/health`) provides real-time status of Ollama connectivity.
