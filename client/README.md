# Home Management System — Frontend (Vercel Deployment Guide)

This is the standalone Next.js frontend powered by Redux Toolkit for ultra-fast, smooth, zero-latency state management and real-time backend synchronization.

---

## 🚀 How to Deploy on Vercel

### Step 1: Import Repository to Vercel
1. Log in to [vercel.com](https://vercel.com) with GitHub.
2. Click **Add New Project** and select this repository (`home-management-system`).

### Step 2: Configure Project Settings
1. In the **Root Directory** setting:
   - Click **Edit** and select `client`.
2. Framework Preset will automatically detect **Next.js**.

### Step 3: Add Environment Variables
Under **Environment Variables**, add:
- **`NEXT_PUBLIC_API_URL`**: Your cPanel API base URL (e.g. `https://api.yourdomain.com/api` or `http://localhost:5000/api` for local testing).

### Step 4: Click Deploy!
- Vercel will build and deploy your app in under 1 minute.
- Your app will have instant persistence:
  - **Redux Toolkit + LocalStorage**: Optimistic, instant updates with zero load-time latency. Never resets on page refresh!
  - **Background API Sync**: Automatically connects and persists data in your cPanel MongoDB backend.
