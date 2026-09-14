# 💰 ExpenseTracker — Personal Expense Tracker & Finance Manager

A modern, full-stack personal finance and expense tracking web application built with the **MERN stack (MongoDB, Express.js, React, Node.js)**, **Tailwind CSS**, and **Recharts**, architected for offline-first PWA capabilities.

[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-19-61dafb.svg?logo=react&logoColor=black)](https://reactjs.org/)
[![Node](https://img.shields.io/badge/Node.js-v20+-339933.svg?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.21-000000.svg?logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47a248.svg?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38bdf8.svg?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

---

## 🌟 Key Features

- 🔐 **Multi-User JWT Authentication**: Secure user registration, password hashing with `bcryptjs`, persistent token login, and strict user data isolation.
- 💳 **Smart Expense Management**:
  - Track amount, category, date, and notes.
  - Payment mode toggle: **Cash** vs. **Online**.
  - Conditional **Online Sub-Types**: `UPI` (GPay/PhonePe), `Debit/Credit Card`, and `Digital Wallet/NetBanking`.
  - Strict conditional validation: Online sub-type is mandatory for online payments and automatically sanitized for cash entries.
- 📅 **Date Grouping & Backdating**:
  - Full backdating support: record expenses for any past date or today.
  - Expense history grouped chronologically with daily subtotals and relative date tags (*Today*, *Yesterday*).
- 🔍 **Live Search & Flexible Filtering**:
  - Case-insensitive search across notes and categories.
  - Filter by date range (`startDate` to `endDate`), category, and payment modes.
- 📊 **Visual Financial Analytics (Recharts)**:
  - **Spending Trends**: Time-series bar charts bucketed weekly (ISO Monday–Sunday), monthly, or yearly with cash vs. online breakdown.
  - **Category Breakdown**: Interactive donut chart with percentages and progress bars.
  - **Payment Mode Split**: Cash vs. Online comparison with sub-type breakdown.
- 🌐 **Timezone-Aware Aggregations**:
  - Aggregation pipelines parameterized by client timezone (e.g. `Asia/Kolkata` IST / UTC+05:30) to prevent day/month period leaks.
- 📱 **Mobile-First Responsive Design**:
  - Adaptive bottom navigation bar for smartphones and clean top navbar for desktops.

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
├── frontend/                 # React + Vite + Tailwind CSS SPA
│   ├── src/
│   │   ├── components/       # Navbar, DashboardView, ExpenseListView, AnalyticsView, ExpenseFormModal, AuthView, Toast
│   │   ├── constants/        # categories.js (categories, badges, colors)
│   │   ├── context/          # AuthContext.jsx
│   │   ├── services/         # api.js (Axios/fetch client with Bearer tokens & timezone headers)
│   │   ├── App.jsx           # Main routing & state container
│   │   ├── index.css         # Tailwind directives & theme styles
│   │   └── main.jsx
│   ├── public/               # _redirects for Netlify
│   ├── vercel.json           # SPA rewrites for Vercel
│   ├── tailwind.config.js
│   ├── vite.config.js
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
- **MongoDB** (Local MongoDB instance running on `localhost:27017` or MongoDB Atlas URI)

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
```

Start the frontend:
```bash
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

## 🧪 Testing & Database Inspection

### Run Backend Verification Test Suite
```bash
cd backend
npm test
```
*Executes automated in-memory MongoDB tests covering CRUD, strict validators, boundary edge cases, and multi-user data isolation.*

### Inspect Local Database Records
```bash
cd backend
npm run db:view
```
*Prints formatted terminal tables of all registered users and expenses.*

---

## ☁️ Deployment Guide ($0 Free Tier)

### 1. Database — MongoDB Atlas (M0 Free Tier)
1. Create a free M0 cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas).
2. Set Network Access to `0.0.0.0/0` (Allow Access from Anywhere).
3. Copy your connection string:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxx.mongodb.net/expense_tracker?retryWrites=true&w=majority
   ```

### 2. Backend — Render (Free Web Service)
1. Go to [dashboard.render.com](https://dashboard.render.com) -> **New Web Service**.
2. Connect your GitHub repository `expense-tracker-pwa`.
3. Configuration:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
4. Add Environment Variables:
   - `NODE_ENV` = `production`
   - `MONGODB_URI` = `mongodb+srv://<user>:<password>@cluster0.xxxx.mongodb.net/expense_tracker?retryWrites=true&w=majority`
   - `JWT_SECRET` = `<any-long-random-string>`
   - `JWT_EXPIRES_IN` = `30d`
   - `DEFAULT_TIMEZONE` = `Asia/Kolkata`
5. Deploy and copy your backend URL (e.g. `https://expense-tracker-backend-xxxx.onrender.com`).

### 3. Frontend — Vercel (Free Tier)
1. Go to [vercel.com](https://vercel.com) -> **Add New Project**.
2. Import `expense-tracker-pwa`.
3. Configuration:
   - **Root Directory**: `frontend`
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Add Environment Variable:
   - `VITE_API_BASE_URL` = `https://expense-tracker-backend-xxxx.onrender.com`
5. Click **Deploy**!

---

## 📄 License
This project is licensed under the [MIT License](LICENSE).
