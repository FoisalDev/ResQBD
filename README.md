# ResQBD - AI Disaster Response Platform for Bangladesh

A full-stack, AI-powered disaster response platform for Bangladesh.

## Tech Stack

- **Frontend**: React 18 + Vite + Tailwind CSS + Framer Motion
- **Backend**: Node.js + Express + Prisma + MySQL + Socket.io
- **AI Service**: Python FastAPI + scikit-learn

## Quick Start

### Prerequisites

- Node.js 20+
- Python 3.11+
- MySQL 8+

### Setup

1. **Clone and install dependencies**

   ```bash
   npm install
   cd client && npm install
   cd ../server && npm install
   cd ../ai-service && pip install -r requirements.txt
   ```

2. **Start MySQL**

   ```bash
   docker-compose up -d
   ```

3. **Setup database**

   ```bash
   cd server
   cp .env.example .env
   npx prisma migrate dev
   npx prisma seed
   ```

4. **Run services**

   ```bash
   # Terminal 1 - AI Service
   cd ai-service
   python -m uvicorn app.main:app --reload

   # Terminal 2 - Backend
   cd server
   npm run dev

   # Terminal 3 - Frontend
   cd client
   npm run dev
   ```

### Default Users

- **Admin**: admin@resqbd.gov.bd / admin123
- **Volunteer**: volunteer@resqbd.org / volunteer123
- **Citizen**: citizen@example.com / citizen123

## Features

- AI-powered flood/cyclone risk prediction
- Emergency SOS with geolocation
- Real-time disaster map
- Volunteer coordination
- Shelter finder
- Relief request and distribution
- Bengali/English language support
- Admin dashboard with analytics
