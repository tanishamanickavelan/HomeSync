# 🏠 MaBot — Household Coordination Platform

> Multi-agent orchestrated household coordination for dual-income families in Tier-1 & Tier-2 Indian cities.

![MaBot](https://img.shields.io/badge/MaBot-v1.0.0-teal)
![React](https://img.shields.io/badge/React-18-blue)
![Node.js](https://img.shields.io/badge/Node.js-18+-green)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Quick Start](#quick-start)
- [Environment Variables](#environment-variables)
- [API Documentation](#api-documentation)
- [Agent Orchestration](#agent-orchestration)
- [Database Schema](#database-schema)
- [Deployment Guide](#deployment-guide)

---

## Overview

MaBot is a production-ready full-stack web application that helps busy dual-income households manage:

- ✅ **Household Tasks** — assign, track, and complete family tasks
- 🛒 **Grocery Tracking** — manage shopping lists with categories
- 💰 **Bill Reminders** — track bills, get alerts before due dates
- 🔧 **Service Bookings** — book plumbers, maids, cleaning, and more
- 🤖 **AI Agent Orchestration** — automated notifications via agent system
- 👨‍👩‍👧 **Family Groups** — invite members, share household data

**Target Cities:** Chennai, Bangalore, Hyderabad, Pune, Coimbatore

---

## Features

### 🤖 Agent System
- **Task Agent** — alerts for tasks due in 24 hours, auto-marks overdue
- **Grocery Agent** — detects low stock, sends reminders
- **Finance Agent** — urgent bill alerts (24h), gentle reminders (3 days)
- **Service Agent** — upcoming service reminders
- **Notification Agent** — orchestrates all alerts to family members

### 🔐 Security
- JWT authentication with 7-day expiry
- bcrypt password hashing (12 rounds)
- Protected routes (frontend + backend)
- Role-based access (admin / member)
- Input validation with express-validator

### 📊 Dashboard
- Real-time family overview
- Task summary with progress bars
- Bill totals with due-date tracking
- Grocery shopping list at a glance
- Unread notification count

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router v6, Tailwind CSS |
| Backend | Node.js, Express.js |
| Database | MongoDB with Mongoose ODM |
| Auth | JWT + bcryptjs |
| Scheduling | node-cron (agent orchestration) |
| Charts | Recharts |
| Icons | Heroicons |
| Deployment | Vercel (frontend) + Render (backend) + MongoDB Atlas |

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                     FRONTEND (React)                 │
│  Pages: Dashboard · Tasks · Groceries · Bills ·     │
│         Services · Profile                          │
│  Context: AuthContext                                │
│  Services: API layer (axios)                        │
└────────────────────┬────────────────────────────────┘
                     │ HTTP/REST
┌────────────────────▼────────────────────────────────┐
│                  BACKEND (Express.js)                │
│  Routes → Controllers → Models → MongoDB            │
│                                                     │
│  ┌──────────────────────────────────────────────┐   │
│  │         AGENT ORCHESTRATION (node-cron)       │   │
│  │                                              │   │
│  │  TaskAgent → GroceryAgent → FinanceAgent     │   │
│  │       └──────────┬──────────────┘           │   │
│  │              NotificationAgent               │   │
│  └──────────────────────────────────────────────┘   │
└────────────────────┬────────────────────────────────┘
                     │ Mongoose ODM
┌────────────────────▼────────────────────────────────┐
│                  MongoDB Database                    │
│  Collections: users · families · tasks · groceries  │
│               bills · services · notifications      │
└─────────────────────────────────────────────────────┘
```

---

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- npm or yarn

### 1. Clone the Repository

```bash
git clone https://github.com/yourname/mabot.git
cd mabot
```

### 2. Setup Backend

```bash
cd server
npm install
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
npm run seed      # Load sample data
npm run dev       # Start backend on port 5000
```

### 3. Setup Frontend

```bash
cd client
npm install
npm start         # Start React dev server on port 3000
```

### 4. Access the App

- **Frontend:** http://localhost:3000
- **API:** http://localhost:5000/api

### Demo Accounts (after seeding)

| Role | Email | Password |
|------|-------|----------|
| Admin | ravi@example.com | password123 |
| Member | priya@example.com | password123 |

**Family Invite Code:** `SHARMA`

---

## Environment Variables

### Backend (`server/.env`)

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/mabot
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=7d
NODE_ENV=development
CLIENT_URL=http://localhost:3000
```

### Frontend (`client/.env`)

```env
REACT_APP_API_URL=http://localhost:5000/api
```

---

## API Documentation

### Authentication

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Register new user | Public |
| POST | `/api/auth/login` | Login | Public |
| GET | `/api/auth/me` | Get current user | Protected |
| PUT | `/api/auth/profile` | Update profile | Protected |
| PUT | `/api/auth/change-password` | Change password | Protected |

### Tasks

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tasks` | Get all family tasks |
| GET | `/api/tasks/stats` | Task statistics |
| POST | `/api/tasks` | Create task |
| PUT | `/api/tasks/:id` | Update task |
| DELETE | `/api/tasks/:id` | Delete task |

**Task object:**
```json
{
  "taskId": 101,
  "title": "Buy groceries",
  "description": "Weekly shopping from Big Bazaar",
  "assigned_to": "userId",
  "due_date": "2024-01-20",
  "priority": "medium",
  "status": "pending",
  "family_id": "familyId",
  "created_by": "userId"
}
```

### Groceries

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/groceries` | Get grocery list |
| GET | `/api/groceries/stats` | Stats by category |
| POST | `/api/groceries` | Add item |
| PUT | `/api/groceries/:id` | Update item |
| PUT | `/api/groceries/mark-all-purchased` | Mark all bought |
| DELETE | `/api/groceries/:id` | Delete item |

### Bills

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/bills` | Get all bills |
| GET | `/api/bills/stats` | Bill statistics |
| POST | `/api/bills` | Add bill |
| PUT | `/api/bills/:id` | Update/mark paid |
| DELETE | `/api/bills/:id` | Delete bill |

### Services

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/services` | Get bookings |
| POST | `/api/services` | Book service |
| PUT | `/api/services/:id` | Update booking |
| DELETE | `/api/services/:id` | Cancel booking |

### Notifications

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/notifications` | Get all notifications |
| PUT | `/api/notifications/:id/read` | Mark as read |
| PUT | `/api/notifications/read-all` | Mark all read |
| DELETE | `/api/notifications/:id` | Delete notification |

### Dashboard

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard` | Aggregated dashboard data |

---

## Agent Orchestration

The orchestrator runs every hour via `node-cron`:

```
FinanceAgent  ──► Notification (bill due < 24h) → URGENT
GroceryAgent  ──► Notification (low stock)       → WARNING
TaskAgent     ──► Notification (task due < 24h)  → WARNING
ServiceAgent  ──► Notification (service < 24h)   → INFO
```

All agents are in `server/services/orchestrator.js`.

To trigger manually (for testing):
```bash
# In a Node REPL or test script
const { runAgentOrchestration } = require('./services/orchestrator');
runAgentOrchestration();
```

---

## Database Schema

### Users Collection
```json
{
  "name": "Ravi Sharma",
  "email": "ravi@example.com",
  "password": "<hashed>",
  "family_id": "ObjectId",
  "role": "admin | member",
  "phone": "+91 99999 99999",
  "preferences": { "notifications": true, "darkMode": false },
  "created_at": "ISODate"
}
```

### Families Collection
```json
{
  "family_name": "The Sharma Family",
  "invite_code": "SHARMA",
  "members": ["ObjectId"],
  "admin": "ObjectId",
  "city": "Chennai",
  "created_at": "ISODate"
}
```

### Tasks Collection
```json
{
  "taskId": 101,
  "title": "Buy groceries",
  "description": "Weekly shopping",
  "assigned_to": "ObjectId",
  "due_date": "ISODate",
  "priority": "low | medium | high | urgent",
  "status": "pending | in_progress | completed",
  "family_id": "ObjectId",
  "created_by": "ObjectId",
  "completed_at": "ISODate",
  "reminder_sent": false
}
```

### Groceries Collection
```json
{
  "item_name": "Aavin Milk",
  "quantity": 2,
  "unit": "L",
  "category": "dairy | vegetables | grains | snacks | household_items | ...",
  "purchased": false,
  "low_stock_threshold": 1,
  "added_by": "ObjectId",
  "family_id": "ObjectId"
}
```

### Bills Collection
```json
{
  "bill_name": "TNEB Electricity",
  "amount": 1850,
  "currency": "INR",
  "due_date": "ISODate",
  "status": "unpaid | paid | overdue",
  "category": "electricity | water | internet | ...",
  "recurring": true,
  "recurring_cycle": "monthly | quarterly | yearly",
  "family_id": "ObjectId",
  "created_by": "ObjectId"
}
```

### Notifications Collection
```json
{
  "message": "🚨 Bill due tomorrow!",
  "type": "task | grocery | bill | service | system",
  "severity": "info | warning | urgent | success",
  "user_id": "ObjectId",
  "family_id": "ObjectId",
  "read_status": false,
  "timestamp": "ISODate"
}
```

---

## Deployment Guide

### Frontend → Vercel

```bash
cd client
npm run build

# Push to GitHub, then:
# 1. Go to vercel.com → New Project → Import from GitHub
# 2. Set Build Command: npm run build
# 3. Set Output Directory: build
# 4. Add env var: REACT_APP_API_URL=https://your-render-backend.onrender.com/api
# 5. Deploy!
```

### Backend → Render

```bash
# 1. Push entire repo to GitHub
# 2. Go to render.com → New → Web Service
# 3. Connect GitHub repo
# 4. Settings:
#    Root Directory: server
#    Build Command: npm install
#    Start Command: npm start
# 5. Add environment variables:
#    MONGODB_URI=mongodb+srv://...
#    JWT_SECRET=your_secret_here
#    NODE_ENV=production
#    CLIENT_URL=https://your-vercel-app.vercel.app
# 6. Deploy!
```

### Database → MongoDB Atlas

```bash
# 1. Go to cloud.mongodb.com → Create Free Cluster
# 2. Create database user
# 3. Whitelist IP: 0.0.0.0/0 (for Render)
# 4. Get connection string:
#    mongodb+srv://<user>:<password>@cluster.mongodb.net/mabot
# 5. Add to Render env vars as MONGODB_URI
```

---

## Project Structure

```
mabot/
├── server/                     # Backend (Node.js + Express)
│   ├── controllers/            # Business logic
│   │   ├── authController.js
│   │   ├── taskController.js
│   │   ├── groceryController.js
│   │   ├── billController.js
│   │   ├── serviceController.js
│   │   └── dashboardController.js
│   ├── routes/                 # API route definitions
│   ├── models/                 # Mongoose schemas
│   │   ├── User.js
│   │   ├── Family.js
│   │   ├── Task.js
│   │   ├── Grocery.js
│   │   ├── Bill.js
│   │   ├── Service.js
│   │   └── Notification.js
│   ├── middleware/
│   │   └── auth.js             # JWT middleware
│   ├── services/
│   │   ├── orchestrator.js     # Agent orchestration
│   │   └── notificationService.js
│   ├── utils/
│   │   └── seedData.js         # Sample data seed
│   └── server.js               # Entry point
│
└── client/                     # Frontend (React)
    ├── public/
    │   └── index.html
    └── src/
        ├── components/
        │   ├── common/         # Shared UI components
        │   └── layout/         # Layout + Sidebar
        ├── contexts/
        │   └── AuthContext.js
        ├── hooks/
        │   └── useToast.js
        ├── pages/              # All page components
        ├── services/
        │   └── api.js          # Axios API service
        ├── App.js
        └── index.js
```

---

## License

MIT © 2024 MaBot

Built for modern Indian families 🇮🇳
