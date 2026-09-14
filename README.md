# ExpensePulse — Personal Expense Tracker (PWA)

A full-stack, offline-first personal finance and expense tracking Progressive Web App (PWA) built with the MERN stack (MongoDB, Express, React 19, Node.js), Tailwind CSS, Recharts, and Dexie.js (IndexedDB).

Designed for mobile-first daily financial tracking with native installability, offline data persistence, and automatic background synchronization.

[![Live App](https://img.shields.io/badge/Live_App-Vercel-black?logo=vercel&logoColor=white)](https://expense-tracker-pwa-six.vercel.app)
[![API Backend](https://img.shields.io/badge/API-Render-black?logo=render&logoColor=white)](https://expense-tracker-backend-4hj2.onrender.com/api/health)
[![React](https://img.shields.io/badge/React-19-61dafb?logo=react&logoColor=black)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38bdf8?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## Live Links

- **Live Application**: [https://expense-tracker-pwa-six.vercel.app](https://expense-tracker-pwa-six.vercel.app)
- **Backend Service**: [https://expense-tracker-backend-4hj2.onrender.com](https://expense-tracker-backend-4hj2.onrender.com)
- **GitHub Repository**: [https://github.com/Ajeetjain1245/expense-tracker-pwa](https://github.com/Ajeetjain1245/expense-tracker-pwa)

---

## Features

### Expense Management
- **Quick Logging**: Log expenses with amount, category, date, payment modes, and optional notes.
- **Payment Modes & Sub-Types**: Toggle between Cash and Online transactions with sub-type tracking (UPI, Cards, Wallets).
- **Date-Grouped History**: Expenses organized chronologically with daily subtotals and relative date labels.
- **Backdating**: Record expenses for today or any past historical date.
- **Live Search & Filters**: Search across notes and filter by date range, category, or payment method.

### Visual Analytics
- **Spending Trends**: Time-series bar charts bucketed by week (ISO Mon–Sun), month, or year with cash vs. online breakdowns.
- **Category Breakdown**: Interactive donut chart displaying category-wise expenditure share.
- **Payment Split**: Visual distribution of cash vs. online transactions and sub-type allocations.

### Offline-First PWA Architecture
- **Native Mobile Experience**: Installable on Android, iOS, and desktop as a standalone application without browser chrome.
- **100% Offline Capability**: Uses **Dexie.js (IndexedDB)** for instant local reads, writes, and dashboard calculations without internet connectivity.
- **Background Auto-Sync**: Automatically detects network status and pushes pending offline changes to MongoDB upon reconnection.
- **Network Status Indicator**: Real-time navbar indicator displaying connection state and pending sync counts.

### Security & User Isolation
- Multi-user authentication using JSON Web Tokens (JWT) and `bcryptjs` password hashing.
- Strict data scoping ensuring each user's financial records and analytics are completely isolated.

---

## Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS, Recharts, Lucide Icons
- **Offline Storage**: Dexie.js (IndexedDB), `vite-plugin-pwa`, Workbox Service Worker
- **Backend**: Node.js (ES Modules), Express.js, Mongoose
- **Database**: MongoDB Atlas
- **Authentication**: JWT, bcryptjs
- **Deployment**: Vercel (Frontend), Render (Backend)

---

## Project Structure

```
expense-tracker/
├── backend/
│   ├── src/
│   │   ├── config/           # Database connection
│   │   ├── controllers/      # Auth, expense, and analytics controllers
│   │   ├── middleware/       # Auth verification & error handling
│   │   ├── models/           # User and Expense schemas
│   │   ├── routes/           # REST API endpoints
│   │   ├── utils/            # Timezone-aware date utilities
│   │   ├── app.js            # Express app configuration & CORS
│   │   └── server.js         # Entrypoint
│   ├── package.json
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── components/       # Views, forms, navbar, and network status
│   │   ├── constants/        # Category metadata and color themes
│   │   ├── context/          # Authentication state & session persistence
│   │   ├── db/               # Dexie.js IndexedDB schema & local cache
│   │   ├── services/         # API client & offline sync manager
│   │   ├── App.jsx           # Main routing & state container
│   │   └── index.css         # Tailwind styles
│   ├── vite.config.js        # Vite & PWA configuration
│   └── package.json
│
└── README.md
```

---

## Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB (local instance or cloud cluster)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Ajeetjain1245/expense-tracker-pwa.git
   cd expense-tracker-pwa
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   ```
   Create a `.env` file in the `backend/` directory:
   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   NODE_ENV=development
   CLIENT_URL=http://localhost:5173
   DEFAULT_TIMEZONE=Asia/Kolkata
   JWT_SECRET=your_jwt_secret
   JWT_EXPIRES_IN=30d
   ```
   Start the backend server:
   ```bash
   npm run dev
   ```

3. **Frontend Setup**
   In a new terminal window:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   Open `http://localhost:5173` in your browser.

---

## Mobile Installation (PWA)

- **Android (Chrome)**: Tap the menu (three dots) ➔ Select **Install App** or **Add to Home Screen**.
- **iOS (Safari)**: Tap the **Share** button ➔ Select **Add to Home Screen**.
- **Desktop (Chrome/Edge)**: Click the **Install** button in the browser address bar.

---

## License

This project is open-source and available under the [MIT License](LICENSE).
