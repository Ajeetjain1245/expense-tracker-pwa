# 💰 ExpenseTracker — Installable Offline-First PWA Mobile App & Finance Manager

A modern, full-stack personal finance and expense tracking **Progressive Web App (PWA)** built with the **MERN stack (MongoDB, Express.js, React 19, Node.js)**, **Tailwind CSS**, **Recharts**, and **Dexie.js (IndexedDB)**. 

Installable directly on **Android, iOS, and Desktop** with full **offline capabilities** and **automatic cloud synchronization**.

[![Live App](https://img.shields.io/badge/Live_App-Vercel-000000.svg?logo=vercel&logoColor=white)](https://expense-tracker-pwa-six.vercel.app)
[![API Backend](https://img.shields.io/badge/Backend-Render-46E3B7.svg?logo=render&logoColor=white)](https://expense-tracker-backend-4hj2.onrender.com/api/health)
[![Database](https://img.shields.io/badge/Database-MongoDB_Atlas-47A248.svg?logo=mongodb&logoColor=white)](https://www.mongodb.com/atlas)
[![React](https://img.shields.io/badge/React-19-61dafb.svg?logo=react&logoColor=black)](https://reactjs.org/)
[![PWA Ready](https://img.shields.io/badge/PWA-Offline_First-5A0FC8.svg?logo=pwa&logoColor=white)](https://web.dev/progressive-web-apps/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 🌐 Live Production Links

- 📱 **Live PWA Web & Mobile App**: [https://expense-tracker-pwa-six.vercel.app](https://expense-tracker-pwa-six.vercel.app)
- ⚙️ **Production REST API (Render)**: [https://expense-tracker-backend-4hj2.onrender.com](https://expense-tracker-backend-4hj2.onrender.com/api/health)
- 📦 **GitHub Source Code**: [https://github.com/Ajeetjain1245/expense-tracker-pwa](https://github.com/Ajeetjain1245/expense-tracker-pwa)

---

## 📱 Mobile PWA & Offline-First Features

- 📲 **Installable Native App Experience**:
  - Install directly on Android (via Chrome) and iOS (via Safari "Add to Home Screen") as a standalone app with custom icons and splash screen.
  - No app store downloads, zero app store fees, and instant seamless auto-updates on every commit.
- ✈️ **100% Offline Capability (IndexedDB + Service Workers)**:
  - Powered by **Dexie.js (IndexedDB)** and **VitePWA**: open the app, log transactions, and view your dashboard even with zero internet or in Airplane Mode.
- ⚡ **Background Cloud Synchronization**:
  - When offline, expenses are marked and saved locally.
  - The moment your device reconnects to the internet, our **`SyncManager`** automatically pushes all local changes to **MongoDB Atlas** and updates your cloud database.
- 🟢 **Live Network & Sync Indicator**:
  - Real-time navbar badge displaying connection state (`Online` / `Offline`) with pending unsynced transaction counters and manual sync triggers.

---

## 🌟 Key Application Features

- 🔐 **Multi-User JWT Authentication**: Secure user registration, password hashing with `bcryptjs`, persistent token login, and strict user data isolation.
- 👋 **Smart Dynamic Greetings**:
  - New Signups: *"Hello, [Name]! 👋 Welcome to your new expense dashboard!"*
  - Returning Users: Time-aware greetings (*"Good morning / Good afternoon / Good evening, [Name]! Welcome back"*).
- 💳 **Prominent Monthly Hero Spend Card**:
  - Instant visual snapshot: *"You have spent this month: ₹X"* with transaction counts, today's sub-stat, and fast "+ Add Expense" action.
- 💵 **Smart Payment Modes & Sub-Types**:
  - Payment Mode toggle: **Cash** vs. **Online**.
  - Conditional **Online Sub-Types**: `UPI` (GPay / PhonePe / Paytm), `Debit/Credit Card`, and `Digital Wallet / NetBanking`.
  - Strict validation: Online sub-type is strictly required for online payments and automatically sanitized for cash entries.
- 📅 **Date Grouping & Backdating**:
  - Full backdating support: record expenses for today or any past historical date.
  - History grouped chronologically with daily subtotals and relative date tags (*Today*, *Yesterday*).
- 🔍 **Live Search & Multi-Filter Engine**:
  - Case-insensitive search across notes and categories.
  - Filter by date range (`startDate` to `endDate`), category, and payment modes.
- 📊 **Visual Financial Analytics (Recharts)**:
  - **Spending Trends**: Time-series bar charts bucketed weekly (ISO Monday–Sunday), monthly, or yearly with cash vs. online breakdown.
  - **Category Breakdown**: Interactive donut chart with percentages and progress bars.
  - **Payment Mode Split**: Cash vs. Online comparison with sub-type breakdown.
- 🌐 **Timezone-Aware Aggregations**:
  - MongoDB aggregations parameterized by client timezone (`Asia/Kolkata` IST / UTC+05:30) ensuring zero month/day boundary leakage.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, Vite 6, Tailwind CSS, Recharts, Lucide Icons |
| **Offline & PWA** | `vite-plugin-pwa`, Workbox Service Worker, Dexie.js (IndexedDB) |
| **Backend** | Node.js (ES Modules), Express.js 4.21, Mongoose 8.9 |
| **Security & Auth** | JSON Web Tokens (JWT), `bcryptjs`, CORS, Timezone Parsers |
| **Database** | MongoDB Atlas (Cloud M0 Cluster) / Local MongoDB |
| **Cloud Hosting** | **Vercel** (Frontend PWA) + **Render** (Backend API) |

---

## 📁 Monorepo Structure

```
expense-tracker/
├── backend/                  # Node.js + Express + Mongoose REST API
│   ├── src/
│   │   ├── config/           # Database connection (db.js)
│   │   ├── controllers/      # authController.js, expenseController.js, analyticsController.js
│   │   ├── middleware/       # authMiddleware.js, errorHandler.js
│   │   ├── models/           # User.js, Expense.js
│   │   ├── routes/           # authRoutes.js, expenseRoutes.js, analyticsRoutes.js
│   │   ├── utils/            # dateUtils.js (timezone & ISO week helpers)
│   │   ├── app.js            # Express app configuration & CORS setup
│   │   └── server.js         # Server entrypoint
│   ├── scripts/              # verify-backend.js, view-db.js
│   ├── .env.example
│   └── package.json
│
├── frontend/                 # React 19 + Vite + Tailwind CSS + PWA
│   ├── src/
│   │   ├── components/       # Navbar, DashboardView, ExpenseListView, AnalyticsView, ExpenseFormModal, AuthView, NetworkStatusBadge, Toast
│   │   ├── constants/        # categories.js (categories, badges, colors)
│   │   ├── context/          # AuthContext.jsx (offline session persistence)
│   │   ├── db/               # indexedDb.js (Dexie.js offline schema & cache)
│   │   ├── services/         # api.js, syncManager.js (offline/online sync engine)
│   │   ├── App.jsx           # Main routing & state container
│   │   ├── index.css         # Tailwind directives & theme styles
│   │   └── main.jsx
│   ├── public/               # favicon.svg, _redirects
│   ├── vercel.json           # SPA rewrites for Vercel
│   ├── tailwind.config.js
│   ├── vite.config.js        # VitePWA plugin & caching strategy
│   └── package.json
│
├── render.yaml               # Render Web Service Blueprint
├── .gitignore
└── README.md
```

---

## 🚀 Quick Start (Local Setup)

### Prerequisites
- **Node.js** (v18 or higher)
- **MongoDB** (Local instance on `localhost:27017` or MongoDB Atlas URI)

### 1. Clone Repository
```bash
git clone https://github.com/Ajeetjain1245/expense-tracker-pwa.git
cd expense-tracker-pwa
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file in `backend/`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/expense_tracker
NODE_ENV=development
CLIENT_URL=http://localhost:5173
DEFAULT_TIMEZONE=Asia/Kolkata
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=30d
```

Start the backend:
```bash
npm run dev
```
> Server runs at `http://localhost:5000`

### 3. Frontend Setup
In a new terminal window:
```bash
cd frontend
npm install
npm run dev
```
> Frontend runs at `http://localhost:5173`

---

## 📡 API Reference

### Authentication (`/api/auth`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/signup` | Register new user `{ name, email, password }` | No |
| `POST` | `/api/auth/login` | Login user `{ email, password }` | No |
| `GET` | `/api/auth/me` | Fetch authenticated user profile | Bearer Token |

### Expenses CRUD (`/api/expenses`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/expenses` | Create an expense | Bearer Token |
| `GET` | `/api/expenses` | List expenses (supports `startDate`, `endDate`, `category`, `paymentMode`, `onlineSubType`, `search`, `page`, `limit`) | Bearer Token |
| `GET` | `/api/expenses/:id` | Get single expense details | Bearer Token |
| `PUT` | `/api/expenses/:id` | Update an existing expense | Bearer Token |
| `DELETE` | `/api/expenses/:id` | Delete an expense | Bearer Token |

### Analytics (`/api/analytics`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/analytics/summary` | Today, This Week (Mon-Sun), This Month, This Year totals | Bearer Token |
| `GET` | `/api/analytics/trends` | Time-series breakdown (`?period=weekly\|monthly\|yearly`) | Bearer Token |
| `GET` | `/api/analytics/categories` | Category totals, counts, and percentages | Bearer Token |
| `GET` | `/api/analytics/payment-modes` | Cash vs. Online split and online subtype breakdown | Bearer Token |

---

## 📲 How to Install the PWA Mobile App

1. Open **[https://expense-tracker-pwa-six.vercel.app](https://expense-tracker-pwa-six.vercel.app)** on your mobile phone or laptop.
2. **On Android (Chrome)**: Tap the 3 dots (⋮) in the top-right corner ➔ Tap **"Install App"** or **"Add to Home Screen"**.
3. **On iOS (Safari)**: Tap the **Share** icon at the bottom ➔ Tap **"Add to Home Screen"**.
4. **On Desktop (Chrome/Edge)**: Click the **Install** icon in the URL address bar or click the **"Install App"** button in the header.
5. The application will launch full-screen like a native mobile app and works seamlessly offline!

---

## 📄 License
This project is licensed under the [MIT License](LICENSE).
