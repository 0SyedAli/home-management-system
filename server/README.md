# Home Management System — Backend API (cPanel Deployment Guide)

This is the standalone Node.js / Express / MongoDB backend for the Home Management System.

---

## 🚀 How to Deploy on cPanel

### Step 1: Upload Files to cPanel
1. Compress and upload the `server` folder contents to your cPanel hosting (e.g. `public_html/api` or a dedicated subdomain folder like `api.yourdomain.com`).
2. Include:
   - `dist/` (compiled JavaScript)
   - `package.json`
   - `app.js` (cPanel application startup file)
   - `.env` (or configure environment variables in cPanel)

### Step 2: Set Up Node.js Application in cPanel
1. In cPanel, navigate to **Setup Node.js App** (or **Node.js Application Manager**).
2. Click **Create Application**.
3. Fill in the configuration:
   - **Node.js Version:** `18.x` or `20.x`
   - **Application Mode:** `Production`
   - **Application Root:** The folder path where you uploaded server files (e.g., `api`)
   - **Application Startup File:** `app.js` (or `dist/server.js`)
   - **Application URL:** your domain/subdomain (e.g., `api.yourdomain.com`)
4. In **Environment Variables**, add:
   - `MONGODB_URI`: Your MongoDB Atlas connection string:
     `mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/home_management_db?retryWrites=true&w=majority`
   - `CLIENT_URL`: Your Vercel frontend URL (e.g. `https://your-app.vercel.app` or `*`)
   - `NODE_ENV`: `production`

### Step 3: Install Packages & Run
1. In cPanel Node.js App page, click **Run NPM Install** (or access terminal and run `npm install --production`).
2. Click **Restart Application**.
3. Verify your backend is running by visiting:
   `https://api.yourdomain.com/api/health`
   You should see: `{"status":"online","service":"Household Financial & Rental Management API"}`

---

## 💻 Local Development

```bash
# Install dependencies
npm install

# Run in development mode (TypeScript)
npm run dev

# Build for production
npm run build

# Start production build
npm start
```
