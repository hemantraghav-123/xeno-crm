# 🚀 Xeno AI CRM (Monorepo)

Xeno AI CRM is a state-of-the-art, premium Customer Relationship Management system powered by Gemini AI. It automates audience segmentation, generates customized marketing campaigns from plain-text goals, and tracks real-time campaign engagement metrics (delivery, open, and click rates) via a simulated messaging broker.

---

## 🔗 Live Deployment

- **AWS Deployed Application**: [http://100-58-201-151.sslip.io](http://100-58-201-151.sslip.io)

*(If you configured a custom domain or DuckDNS subdomain, replace the link above with your custom domain).*

---

## ✨ Features

- 🧠 **AI Audience Segment Builder**: Define complex query segments (e.g., *"Users who spent over ₹10,000 and haven't ordered in 60 days"*) in plain English. The AI parses the request, executes safe database filtering, and returns the audience count and list.
- ✉️ **AI Campaign Generator**: Put in your marketing goal, and Gemini will automatically generate highly personalized message templates, select the optimal transmission channel (WhatsApp, Email, SMS), and recommend it.
- ⚡ **Asynchronous Messaging Broker (Channel Service)**: Simulates the delivery lifecycle. Dispatches messages and reports back callbacks (`DELIVERED`, `OPENED`, `CLICKED`, `FAILED`) to update campaign analytics in real-time.
- 📊 **Real-time Analytics Dashboard**: 
  - Campaign Funnel chart built with Recharts.
  - Cohort Retention Analysis heatmap to track monthly customer repeat rates.
  - Performance comparison table for all marketing runs.
- 🌓 **Premium UI/UX**: Implements high-end glassmorphism, tailored dark/light color schemes, fluid micro-animations, and responsive layout scaling.

---

## 🛠️ Tech Stack

- **Frontend**: Next.js 16 (App Router, Turbopack), TypeScript, TailwindCSS, Lucide Icons, Recharts, Axios.
- **Backend API**: Node.js, Express, TypeScript, Prisma ORM, PostgreSQL.
- **Channel Service**: Node.js, Express, Axios.
- **Databases**: PostgreSQL (Neon Serverless Database).
- **AI Engine**: Google Gemini API (`@google/generative-ai`).
- **CI/CD**: GitHub Actions (lint checks, build execution, automatic EC2 deployment).
- **Production Server**: AWS EC2 (`t2.micro` Free Tier), Nginx (Reverse Proxy & SSL), PM2 (Process Manager).

---

## 📁 Repository Structure

```text
xeno-crm/
├── frontend/               # Next.js frontend UI client
├── backend/                # Express API with Prisma PostgreSQL schemas
├── channel-service/        # Message delivery simulator and callback broker
├── deployment/             # Server configuration templates (Nginx, PM2 Ecosystem)
├── .github/workflows/      # GitHub Actions CI/CD pipeline workflows
└── package.json            # Monorepo root manager (concurrent runner)
```

---

## 💻 Local Setup & Installation

Get the entire monorepo up and running locally in two commands:

### 1. Install all dependencies
Installs package sets inside the frontend, backend, and channel service folders simultaneously:
```bash
npm run install:all
```

### 2. Configure Environment Variables
Create a `.env` file inside the `backend` folder:
```env
DATABASE_URL="postgresql://username:password@host:port/database?sslmode=require"
Gemini_API_KEY="your-gemini-api-key"
PORT=5000
JWT_SECRET="your-super-secret-jwt-key"
```

Create a `.env.local` file inside the `frontend` folder:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### 3. Run all services concurrently
Starts the Frontend (port `3000`), Backend (port `5000`), and Channel Service (port `6001`) simultaneously:
```bash
npm run dev
```

---

## ☁️ Production Deployment on AWS Free Tier

This project includes fully automated GitHub Actions CI/CD workflows to build, test, and deploy all services to an AWS EC2 instance without incurring any costs.

Refer to the [deployment/nginx.conf](file:///c:/Users/Hemant%20Raghav/xeno-crm/xeno-crm/deployment/nginx.conf) and [deployment/ecosystem.config.js](file:///c:/Users/Hemant%20Raghav/xeno-crm/xeno-crm/deployment/ecosystem.config.js) files for production configurations.

### CI/CD Deployment Flow
- **Next.js Frontend Workflow**: Triggers when files in `frontend/` change. Compiles code on runner, transfers to EC2, and restarts using PM2.
- **Backend Workflow**: Triggers when files in `backend/` change. Runs TypeScript compiler, transfers to EC2, runs Prisma migrations, and restarts under PM2.
- **Channel Service Workflow**: Triggers when files in `channel-service/` change. Compiles code, transfers to EC2, and restarts using PM2.
