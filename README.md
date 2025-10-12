# 🧠 TRADEX – Virtual Trading & Strategy Lab

**TRADEX** is a next-generation virtual trading platform that lets users **learn trading by experimentation** — backtest strategies, run automated copilot bots, and even connect their own AI strategy APIs.

---

## 🚀 Demo Links

- 🌐 **Live App: https://trading-app-web.onrender.com
- 🎥 **Demo Video:https://drive.google.com/file/d/1qmmGWet27b6YINFa6_iPnp1bGxNEohQm/view

---

## 🧩 Core Features

| Feature | Description |
|----------|--------------|
| **🧠 No-Code Strategy Builder** | Create trading strategies visually using indicators (SMA, EMA, RSI, Price). |
| **⚙️ Backtesting Engine** | Test your logic using real Binance historical data with trade logs and charts. |
| **🤖 Copilot Mode** | Run live, auto-executing trading bots that execute your strategy every few seconds. |
| **🪄 AI Suggestion Layer** | Integrated AI assistant helps optimize strategy rules and conditions. |
| **📊 Visual Analytics** | Equity curves, candlestick charts, trade outcomes, and portfolio metrics. |

---

## 🧱 Tech Stack

### **Frontend**
- Next.js 14 (App Router)
- TailwindCSS + ShadCN UI
- SWR for real-time updates
- Clerk for user authentication
- Recharts for visualization

### **Backend**
- Next.js API Routes (Node.js)
- MongoDB + Mongoose
- Redis (for caching)
- Background Worker (`server/liveWorker.js`)
- Deployed on **Render**

### **External APIs**
- Binance Market Data API
- Custom Strategy API (user-hosted on Render)
- Clerk Authentication API

---

## ⚡ System Architecture

│ FRONTEND │
│ Next.js + SWR + Clerk Auth │
└──────────────┬─────────────┘
│
▼
┌────────────────────────────┐
│ NEXT.JS API │
│ Backtest / User / Klines │
└──────────────┬─────────────┘
│
▼
┌────────────────────────────┐
│ MongoDB | Redis (Cache) │
│ LiveRun | Kline Data │
└──────────────┬─────────────┘
│
▼
┌────────────────────────────┐
│ Background Worker │
│ liveWorker.js → Strategy API│
│ Executes trades, updates DB │
└────────────────────────────┘


---

## ⚙️ Setup Instructions

### 1️⃣ Environment Variables
Add the environment variables 
(ask me for that) 

bash
Copy code

### 2️⃣ Local Development
```bash
git clone https://github.com/ashishrajz/tradex.git
cd tradex
npm install
npm run dev
3️⃣ Deploy to Render
Create a Next.js Web Service for the main app.

Add another service of type Background Worker for:

bash
Copy code
node server/liveWorker.js
Ensure both share the same .env variables.

4️⃣ Keep Worker Alive
Use UptimeRobot to ping the deployed URL every few minutes to prevent Render from idling.

You can use https://strategy-api-tloe.onrender.com/ as a strategy url it has a simple logic if price goes above 100 sell and comes below 50 then buy.

🧠 How It Works
User selects or creates a strategy (no-code or custom API).

Backtest API simulates trades using Binance data.

Copilot Mode polls Binance ticker every 10s via the worker, executes trades, and stores results in MongoDB.

Frontend visualizes live results via SWR and Recharts.


🚧 Future Improvements

WebSocket live updates.

Stress testing & performance tuning.

Strategy marketplace.

AI-based auto-optimization.
