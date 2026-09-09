# 🤖 AI Interview Simulator

An AI-powered interview practice platform built with **React, TypeScript, Vite, Express and Google Gemini**.

## ✨ Features

- 🎤 AI interview practice
- 🧑‍💻 Frontend, React and Full-Stack interview tracks
- 📊 Interview results and performance analysis
- 📈 Progress dashboard with performance trends
- 📝 AI-powered ATS resume checker
- 📄 PDF/DOCX resume text extraction
- 💻 Coding practice area
- 🕘 Interview history
- 🌓 Dark/light theme
- 🎙️ Speech recognition and speech synthesis
- 🛡️ Admin analytics portal

## 🧰 Tech Stack

- React 19 + TypeScript
- Vite
- Express.js
- Google Gemini (`@google/genai`)
- Tailwind CSS
- React Router
- Recharts
- jsPDF / Mammoth / pdf-parse

## 🚀 Run locally

### Prerequisites

- Node.js 20+ recommended
- A Google Gemini API key for Gemini-powered features

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Copy `.env.example` to `.env.local` and add your secrets:

```env
GEMINI_API_KEY=your_gemini_api_key
ADMIN_KEY=your_long_random_admin_key
```

**Never commit `.env.local` or any real API key.**

### 3. Start development

```bash
npm run dev
```

Open `http://localhost:3000`.

### 4. Production build

```bash
npm run build
npm start
```

The Express server serves the built Vite SPA and API from the same origin.

## ☁️ Free deployment with Render

This repository is configured for a Render **Free Web Service** using `render.yaml`. Render supports Node/Express web services on its free tier; free services can spin down after inactivity, so the first request after idle time may be slow.

### Deploy

1. Push this repository to GitHub.
2. In Render, create a **New → Web Service** and connect the GitHub repository.
3. Render can use the included `render.yaml`, or use:
   - **Build command:** `npm ci --no-audit --no-fund && npm run build`
   - **Start command:** `npm start`
4. Add these environment variables in Render:
   - `GEMINI_API_KEY` = your Gemini API key
   - `ADMIN_KEY` = a strong private admin key
   - `NODE_ENV` = `production`
5. Deploy. Render provides an `onrender.com` URL.

### Important free-tier note

The app currently uses a JSON file for local application data. Free hosting files are ephemeral, so interview history/user data can be lost when the service is restarted or redeployed. For a production app, move persistent data to a real database.

## 🔐 Security

- Gemini API access is kept on the server; the production Vite build does **not** inject `GEMINI_API_KEY` into browser code.
- Keep `GEMINI_API_KEY` and `ADMIN_KEY` in hosting environment variables/secrets.
- Do not commit `.env.local`, API keys, or private credentials.

## 🩺 Health check

```text
GET /api/health
```

A healthy deployment returns a JSON response containing `status: "ok"`.

## 📄 License

Personal portfolio / educational project.
