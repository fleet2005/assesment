# Front Desk System - Clinic Management

A complete full-stack web application for managing clinic front desk operations including doctor profiles, appointments, and patient queues.

## 🏗️ Tech Stack

- **Frontend**: Next.js 14 + Tailwind CSS
- **Backend**: NestJS + TypeORM + JWT Authentication
- **Database**: PostgreSQL (Neon.tech managed cloud)
- **Deployment**: Vercel (Frontend) + Render (Backend)

## 📁 Project Structure

```
front-desk-system/
├── frontend/                 # Next.js frontend application
│   ├── src/
│   │   ├── app/             # App router pages
│   │   ├── components/      # Reusable UI components
│   │   ├── lib/             # Utilities and configurations
│   │   └── types/           # TypeScript type definitions
│   └── package.json
├── backend/                  # NestJS backend application
│   ├── src/
│   │   ├── auth/            # JWT authentication
│   │   ├── doctors/         # Doctor management
│   │   ├── appointments/    # Appointment management
│   │   ├── queue/           # Queue management
│   │   └── common/          # Shared utilities
│   └── package.json
└── README.md
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- PostgreSQL database (Neon.tech recommended)

### 1. Database Setup

1. Create a PostgreSQL database on [Neon.tech](https://neon.tech)
2. Copy your database connection string
3. Update the `.env` files in both frontend and backend directories

### 2. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Update .env with your database credentials
npm run start:dev
```

The backend will be available at `http://localhost:3001`

### 3. Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
# Update .env with backend API URL
npm run dev
```

The frontend will be available at `http://localhost:3000`

## 🔐 Authentication

The system uses JWT-based authentication for front desk staff:

- **Default Admin**: `admin@clinic.com` / `admin123`
- JWT tokens are stored in HTTP-only cookies
- Session persistence across browser sessions

## 📋 Features

### 👩‍⚕️ Doctor Management
- Add, edit, delete doctor profiles
- Manage specializations and availability
- Filter and search doctors

### 📅 Appointment Management
- Book, reschedule, cancel appointments
- View available time slots
- Conflict-free scheduling validation

### ⏳ Queue Management
- Add walk-in patients to queue
- Track patient status (Waiting, With Doctor, Completed)
- Priority management for urgent cases

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm run test
npm run test:e2e
```

### Frontend Tests
```bash
cd frontend
npm run test
```

## 🚀 Deployment

### Backend Deployment (Render)
1. Connect your GitHub repository to Render
2. Set environment variables in Render dashboard
3. Deploy as a Web Service

### Frontend Deployment (Vercel)
1. Connect your GitHub repository to Vercel
2. Set environment variables
3. Deploy automatically on push

## 📝 Environment Variables

### Backend (.env)
```
DATABASE_URL=postgresql://user:password@host:port/database
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d
PORT=3001
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_NAME=Clinic Front Desk
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details 