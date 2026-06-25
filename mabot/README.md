# 🏠 MaBot — AI-Powered Household Coordination Platform

> Multi-agent household coordination platform designed for dual-income families in Tier-1 and Tier-2 Indian cities.

![MaBot](https://img.shields.io/badge/MaBot-v1.0.0-teal)
![React](https://img.shields.io/badge/React-18-blue)
![Node.js](https://img.shields.io/badge/Node.js-18+-green)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green)

---

# 📋 Overview

MaBot helps families efficiently manage daily household operations through intelligent task coordination, automated reminders, and AI-driven notification agents.

## Problem Statement

Dual-income families often struggle to coordinate household responsibilities, track bills, manage groceries, schedule services, and stay informed about important events.

MaBot addresses this challenge through an AI-driven multi-agent coordination system that automates reminders, tracks household activities, and ensures all family members remain synchronized through centralized management and email notifications.

## Features

* ✅ Manage household tasks collaboratively
* ✅ Track groceries and shopping requirements
* ✅ Monitor utility bills and due dates
* ✅ Schedule household services
* ✅ Receive automated notifications
* ✅ Coordinate family responsibilities from a single dashboard

---

# 🚀 Key Features

## 🤖 Multi-Agent Household Coordination

### Task Agent

* Detects upcoming deadlines
* Sends reminders before due dates
* Marks overdue tasks automatically

### Grocery Agent

* Monitors grocery inventory
* Detects low-stock items
* Generates shopping reminders

### Finance Agent

* Tracks bill due dates
* Sends urgent payment reminders
* Prevents missed payments

### Service Agent

* Tracks upcoming service bookings
* Generates timely notifications

### Notification Agent

* Centralized notification orchestration
* Delivers reminders across the household
* Sends email notifications to all family members

---

# 📧 Email Notification System

MaBot includes an automated email notification system powered by:

* Gmail SMTP
* Nodemailer
* Gmail App Password Authentication

Whenever an important household event occurs:

* Task deadlines approaching
* Bills nearing due dates
* Grocery stock running low
* Service appointments approaching

the Notification Agent automatically sends email alerts to all registered household members.

This ensures that every family member stays informed even when they are not actively using the application.

---

# 🔐 Security Features

* JWT Authentication
* Password hashing with bcrypt
* Protected API routes
* Role-based access control
* Secure environment variable management

---

# 🛠 Tech Stack

| Layer            | Technology              |
| ---------------- | ----------------------- |
| Frontend         | React.js, Tailwind CSS  |
| Backend          | Node.js, Express.js     |
| Database         | Supabase PostgreSQL     |
| Authentication   | JWT + bcrypt            |
| Email Service    | Nodemailer + Gmail SMTP |
| Scheduling       | Node-Cron               |
| State Management | React Context API       |
| Charts           | Recharts                |

---

# 🏗 System Architecture

```text
Frontend (React)
        │
        ▼
    REST APIs
        │
        ▼
Backend (Node.js + Express)
        │
        ▼
Agent Orchestration Layer
   ├── Task Agent
   ├── Grocery Agent
   ├── Finance Agent
   ├── Service Agent
   └── Notification Agent
        │
        ▼
Supabase PostgreSQL
        │
        ▼
Email Notification Service
(Nodemailer + Gmail SMTP)
```

---

# ⚙ Environment Variables

## Backend (.env)

```env
PORT=5000

SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key

JWT_SECRET=your_jwt_secret

EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password

CLIENT_URL=http://localhost:3000
```

## Frontend (.env)

```env
REACT_APP_API_URL=http://localhost:5000/api
```

---

# 🧠 Agent Workflow

### Finance Agent

Bill Due Reminder
⬇
Notification Agent
⬇
Email Sent To Family Members

### Task Agent

Task Due Reminder
⬇
Notification Agent
⬇
Email Sent To Family Members

### Grocery Agent

Low Stock Alert
⬇
Notification Agent
⬇
Email Sent To Family Members

### Service Agent

Upcoming Booking Reminder
⬇
Notification Agent
⬇
Email Sent To Family Members

---

# 🚧 Project Status

### Completed Features

* User Authentication
* Household Task Management
* Grocery Tracking System
* Bill Reminder Management
* Service Booking Management
* Multi-Agent Orchestration System
* Automated Email Notifications
* Family Member Coordination Dashboard
* Supabase Database Integration

### Future Enhancements

* WhatsApp Notifications
* Push Notifications
* AI Scheduling Assistant
* Predictive Grocery Recommendations
* Voice-Enabled Household Assistant

---

# 📄 License

MIT License

Built for modern Indian families 🇮🇳
