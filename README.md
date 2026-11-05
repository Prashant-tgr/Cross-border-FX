# Cross-Border FX Spread & Remittance Router

> An enterprise treasury and B2B remittance platform that tracks real-time spreads across **SWIFT**, **local clearing rails**, and **fintech partners**, dynamically routing international commercial supplier transfers for optimal rates, lowest spread, and guaranteed delivery SLAs.
> 
> **Commercial Model:** \$2,000/mo flat retainer or basis point (bps) profit split.

---

## 🏛️ Architecture Overview

The system strictly adheres to the project development guidelines:
- **Frontend (`/client`)**: Built with **Next.js (App Router)**, **TypeScript**, and **Tailwind CSS**. Fully responsive and modular, equipped with real-time rate comparison tickers, dynamic quote engine, supplier directory, and treasury audit dashboards.
- **Backend API (`/server`)**: Developed with **Node.js** and **Express.js (ES Modules)**, following clean domain architecture (controllers, services, middleware, routes, models).
- **Database (`MongoDB`)**: Powered by **Mongoose** with schema validation for users, commercial suppliers, rate feeds, and transaction records.
- **Security & Reliability**: Features Helmet security headers, CORS origin whitelisting, JWT authentication, RBAC authorization, and Zod input validation.

---

## 📂 Project Structure

```
Cross-border FX/
├── client/                               # Next.js Frontend Application
│   ├── src/
│   │   ├── app/
│   │   │   ├── globals.css               # Modern Tailwind CSS styling
│   │   │   ├── layout.tsx                # Master root layout with metadata
│   │   │   └── page.tsx                  # Treasury dashboard, routing comparator & audit hub
│   │   ├── lib/
│   │   │   └── api.ts                    # Resilient API client with seamless fallbacks
│   │   └── types/
│   │       └── fx.ts                     # TypeScript interfaces (Rails, Quotes, Suppliers, Audits)
│   ├── package.json
│   └── tsconfig.json
│
├── server/                               # Node.js + Express Backend API
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js                     # MongoDB connection with Mongoose
│   │   ├── controllers/
│   │   │   ├── auth.controller.js        # JWT registration & login
│   │   │   ├── rates.controller.js       # Live corridor rates & spread queries
│   │   │   ├── routing.controller.js     # Multi-rail routing quote optimizer
│   │   │   ├── suppliers.controller.js   # Commercial supplier CRUD operations
│   │   │   └── transfers.controller.js   # Remittance execution & treasury analytics
│   │   ├── middleware/
│   │   │   ├── auth.js                   # JWT protection & role restriction
│   │   │   ├── error.js                  # Centralized AppError handling
│   │   │   └── validate.js               # Zod schema validation
│   │   ├── models/
│   │   │   ├── User.js                   # User schema with pricing plan tier
│   │   │   ├── Supplier.js               # Supplier accounts & preferred routing
│   │   │   ├── RateFeed.js               # Multi-rail quotes & corridor records
│   │   │   └── Transfer.js               # Dispatched transactions & profit split log
│   │   ├── routes/
│   │   │   ├── auth.routes.js
│   │   │   ├── rates.routes.js
│   │   │   ├── routing.routes.js
│   │   │   ├── suppliers.routes.js
│   │   │   ├── transfers.routes.js
│   │   │   └── index.js                  # Master API router
│   │   ├── services/
│   │   │   ├── fxAggregator.service.js   # Multi-rail spread & fee calculations
│   │   │   └── routingEngine.service.js  # Dynamic cost-benefit ranking algorithm
│   │   ├── utils/
│   │   │   └── seed.js                   # Demo database seed script
│   │   └── server.js                     # Express server entrypoint
│   ├── .env.example
│   ├── .env
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## ⚡ Quick Start

### 1. Prerequisites
- **Node.js** v20+ (tested on Node v23)
- **MongoDB** (local `mongodb://127.0.0.1:27017/cross_border_fx` or MongoDB Atlas URI)

### 2. Backend Setup
```bash
cd server
npm install
# Seed demo corporate user, suppliers, and rate corridors:
npm run seed
# Start development server:
npm run dev
```
Backend runs at: `http://localhost:5000`
Health check: `http://localhost:5000/api/health`

### 3. Frontend Setup
```bash
cd client
npm install
npm run dev
```
Frontend runs at: `http://localhost:3000`

---

## 💱 Multi-Rail Execution Engine

| Rail Category | Example Rails | Typical Spread (bps) | Fixed Fee | Typical SLA |
| :--- | :--- | :--- | :--- | :--- |
| **Fintech Partners** | Airwallex, Wise, Nium | 28 – 35 bps | \$2.50 – \$3.50 | 2 – 4 hours |
| **Local Domestic Clearing** | SEPA Instant, ACH, Pix, NEFT, Faster Payments | 45 bps | \$4.50 | 1 – 2 hours |
| **Traditional SWIFT** | Correspondent Banking Network | 220 – 260 bps | \$45.00 | 48 – 72 hours |

---

## 💰 Monetization Model
- **\$2,000/month Flat Retainer**: Ideal for high-frequency enterprise corporate treasuries.
- **Basis Point (bps) Profit Split**: Platform retains 20% of net savings realized compared to the high-street commercial bank benchmark.
