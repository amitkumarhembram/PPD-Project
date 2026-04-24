# SRES — Student Registration & Enrollment System

A full-stack web application for managing student registrations, document uploads, and program enrollments for universities and colleges.

---

## Features

### Student Portal
- Register and log in securely
- Fill personal, family, and academic details
- Upload required documents (Aadhar, marksheets, certificates)
- Apply for enrollment into a program and branch
- Track application status in real time

### Admin Panel
- Superadmin and Moderator roles
- Review and verify student applications
- Approve or reject enrollments
- Manage academic structure (levels, programs, branches, subjects)
- View detailed student profiles and uploaded documents

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, Tailwind CSS, React Router |
| Backend | Node.js, Express 5 |
| Database | PostgreSQL (Supabase) |
| Auth | JWT (JSON Web Tokens) |
| File Uploads | Multer |
| Hosting | Vercel (frontend), Render (backend) |

---

## Project Structure

```
├── backend/
│   ├── src/
│   │   ├── config/        # Database connection
│   │   ├── controllers/   # Route handlers
│   │   ├── middlewares/   # Auth & upload middleware
│   │   ├── models/        # DB query models
│   │   ├── routes/        # API routes
│   │   ├── services/      # Business logic
│   │   ├── utils/         # Helpers (JWT, bcrypt)
│   │   └── workers/       # Background jobs
│   ├── database/
│   │   └── schema.sql     # Full DB schema
│   ├── seed-production.js # One-time DB seed script
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Student & Admin pages
│   │   ├── services/      # Axios API client
│   │   └── hooks/         # Custom React hooks
│   └── package.json
```

---

## Getting Started (Local Development)

### Prerequisites
- Node.js 18+
- PostgreSQL (local) or a Supabase project

### Backend Setup

```bash
cd backend
npm install
cp .env.template .env
# Fill in your DB credentials in .env
node src/index.js
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend runs on `http://localhost:3000` and proxies `/api` requests to the backend at `http://localhost:5000`.

---

## Environment Variables

### Backend (`.env`)

| Variable | Description |
|---|---|
| `DATABASE_URL` | Full PostgreSQL connection string (used in production) |
| `JWT_SECRET` | Secret key for signing JWT tokens |
| `PORT` | Server port (default: 5000) |
| `FRONTEND_URL` | Frontend URL for CORS (e.g. your Vercel URL) |

### Frontend (Vercel)

| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend URL (e.g. your Render URL) |

---

## Database Setup (Production)

1. Create a Supabase project
2. Get the connection string from **Project Settings → Database**
3. Set it as `DATABASE_URL` in your backend environment
4. Run the seed script once:

```bash
DATABASE_URL=<your-connection-string> node seed-production.js
```

This creates all tables and seeds the superadmin account.

---

## API Overview

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Student registration |
| POST | `/api/auth/login` | Student login |
| POST | `/api/auth/admin/login` | Admin login |
| GET | `/api/application` | Get student application |
| PUT | `/api/application` | Update application details |
| POST | `/api/documents/upload` | Upload a document |
| GET | `/api/admin/applications` | List all applications (admin) |
| PUT | `/api/admin/applications/:id` | Approve/reject application (admin) |
| GET | `/api/admin/stats` | Dashboard statistics (admin) |

---

## Deployment

### Backend → Render
1. Connect your GitHub repo
2. Set root directory to `backend`
3. Build command: `npm install`
4. Start command: `node src/index.js`
5. Add environment variables: `DATABASE_URL`, `JWT_SECRET`, `FRONTEND_URL`, `PORT`

### Frontend → Vercel
1. Connect your GitHub repo
2. Set root directory to `frontend`
3. Build command: `npm run build`
4. Output directory: `dist`
5. Add environment variable: `VITE_API_URL`

---

## License

This project is proprietary software. All rights reserved.
