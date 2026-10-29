# Code Review Assistant for Beginner Programmers

A full-stack web application designed to help beginner computer science students receive constructive, educational feedback on their programming code.

---

## Project Structure

```text
code-review-assistant/
├── .gitignore
├── README.md
├── backend/
│   ├── .env
│   ├── .env.example
│   ├── .gitignore
│   ├── package.json
│   └── src/
│       ├── app.js
│       └── server.js
└── frontend/
    ├── .gitignore
    ├── index.html
    ├── package.json
    ├── vite.config.js
    └── src/
        ├── App.css
        ├── App.jsx
        ├── index.css
        └── main.jsx
```

---

## Tech Stack

- **Frontend**: React 18, Vite 6, Modern CSS (ES Modules)
- **Backend**: Node.js (v24+), Express.js (v4), CORS, Dotenv (ES Modules)

---

## Getting Started (Windows PowerShell)

### 1. Install Backend Dependencies
```powershell
cd backend
npm install
```

### 2. Install Frontend Dependencies
```powershell
cd ..\frontend
npm install
```

### 3. Running the Development Servers

Open two separate Windows PowerShell windows or tabs:

**Terminal 1 (Backend Server):**
```powershell
cd C:\Users\kulis\.gemini\antigravity\scratch\code-review-assistant\backend
npm run dev
```
> Runs at `http://localhost:5000` with Node's native file watcher (`--watch`).

**Terminal 2 (Frontend Client):**
```powershell
cd C:\Users\kulis\.gemini\antigravity\scratch\code-review-assistant\frontend
npm run dev
```
> Runs at `http://localhost:5173` with Vite HMR.

---

## Verifying the Health Check

In PowerShell:
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/health"
```

Expected Output:
```json
{
  "status": "ok",
  "message": "Backend server is running healthy and ready for requests.",
  "timestamp": "2026-10-29T..."
}
```
