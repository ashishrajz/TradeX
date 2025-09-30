# PART A — Writeup

## Project: TradeX — Online Trading Platform for Learning Trading
**Team:** Ctrl Alt Elite
**Repo:** https://github.com/ashishrajz/TradeX 
**Demo:** Not yet deployed  
**Video:** https://drive.google.com/file/d/1qmmGWet27b6YINFa6_iPnp1bGxNEohQm/view?usp=drivesdk

---

## 1. Approach

### System Architecture
- **Frontend & Backend:** Combined in a **Next.js** application.
- **Authentication:** **Clerk** for user management, with **webhooks** to sync user data into MongoDB.
- **Database:** **MongoDB** for storing user profiles, strategies, and trade history.
- **Caching layer:** **Redis** used to cache frequently requested trading data (candlesticks, price updates) to reduce API overhead.
- **UI/UX:** Built with **shadcn/ui** components and **Tailwind CSS** for fast, modern design.
- **External APIs:** Integrated with **Binance API** and **CoinGecko API** for real-time market data.
- **Deployment:** (Planned) Frontend/backend on Vercel, database on MongoDB Atlas, and Redis via Upstash.

**High-level flow:**
---

## 2. Technologies Used
- **Next.js** — React framework for combined frontend + backend APIs.
- **MongoDB Atlas** — main database for persistent user and trading data.
- **Clerk** — authentication & identity management with webhook sync.
- **Redis (Upstash)** — caching market data for performance.
- **Tailwind CSS** — styling.
- **shadcn/ui** — prebuilt UI components for a clean interface.
- **Binance & CoinGecko APIs** — external data providers for live trading data.

---

## 3. Design Choices
- Chose **Next.js (combined app)** to simplify deployment (one project handles both UI and API routes).  
- Used **Clerk** instead of building custom auth to save time and ensure secure session handling.  
- Added **Redis caching** to avoid hitting Binance/CoinGecko rate limits and improve response time for charts.  
- Used **shadcn/ui** + Tailwind to focus on core functionality while still delivering a professional UI.  
- Decided on **webhooks for Clerk → MongoDB sync** so user data remains consistent between auth and DB.  

---

## 4. Challenges Faced & Solutions

1. **Understanding Binance & CoinGecko APIs**  
   - *Challenge:* API documentation was complex, especially candlestick/Kline data formats.  
   - *Solution:* Studied API docs and sample payloads, mapped them into a normalized format for frontend consumption.

2. **Rendering candlestick charts correctly**  
   - *Challenge:* Converting raw Kline data (OHLC) into a format usable by charting libraries.  
   - *Solution:* Implemented a parser and verified against live Binance UI to ensure accurate candle patterns.

3. **Caching with Redis**  
   - *Challenge:* Avoiding stale data while still reducing API calls.  
   - *Solution:* Used Redis TTL-based caching (e.g., refresh every X seconds) and cache invalidation strategies for active symbols.

4. **Auth integration with Clerk**  
   - *Challenge:* Keeping Clerk accounts synced with MongoDB.  
   - *Solution:* Implemented webhook listener in Next.js API routes to update MongoDB whenever user signs up/updates profile.

---

## 5. Progress Status (so far)

- ✅ Core functionality working:
  - User auth (Clerk) integrated with MongoDB.  
  - Market data fetching from Binance/CoinGecko.  
  - Redis caching implemented for candlestick & symbol price data.  
  - Basic UI for trading dashboard built with shadcn/ui + Tailwind.  

- 🚧 Work-in-progress:
  - **Auto-pilot trading strategies** (simulate trades based on predefined logic).  
  - **AI trading suggestions** (recommend strategies using ML or rule-based heuristics).  
  - Polishing candlestick chart interactivity & real-time updates.  

---

## 6. Approximate Cost Estimation (at scale)

| Service                  | Provider / Plan     | Est. Monthly Cost |
|---------------------------|---------------------|------------------:|
| Next.js hosting           | Vercel Pro         | $20 – $50 |
| MongoDB database          | MongoDB Atlas (M10)| $50 – $200 |
| Redis caching             | Upstash            | $10 – $50 |
| Clerk authentication      | Clerk Pro Tier     | $25 – $100 |
| External APIs             | Binance (free), CoinGecko (free/limits) | $0 – $50 |
| CDN, logs, monitoring     | Vercel/3rd party   | $10 – $50 |
| **Total (monthly est.)**  |                    | **$115 – $500** |

> Note: Current prototype runs on free tiers (Vercel Hobby, MongoDB free cluster, Upstash free, Clerk free plan). Costs above assume scaling to thousands of users.

---

## 7. Future Improvements
- Implement fully functional auto-trading engine with backtesting.  
- Add AI-powered strategy recommender (using ML or rule-based heuristics).  
- Enhance charting with more indicators (RSI, MACD, Bollinger Bands).  
- Deploy staging + production environments with CI/CD.  
- Optimize Redis usage with smarter invalidation policies.  

---
