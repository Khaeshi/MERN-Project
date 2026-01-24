This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

# ☕ Cafe Management System

> A full-stack MERN application for managing a modern cafe with online ordering, menu management, and customer reviews.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-v20.x-green.svg)
![MongoDB](https://img.shields.io/badge/mongodb-v7.x-green.svg)


## 🌟 Features

- 🛒 **Online Ordering** - Customers can order food and drinks online
- 📋 **Menu Management** - Admin can add, edit, and delete menu items
- 👤 **User Authentication** - Secure login/signup with JWT
- 💳 **Payment Integration** - Stripe payment processing
- ⭐ **Reviews & Ratings** - Customer feedback system
- 📱 **Responsive Design** - Mobile-friendly interface
- 🔍 **Search & Filter** - Find items by category, price, etc.

## 🚀 Quick Start

### Prerequisites

- Node.js v20 or higher
- MongoDB v7 or higher
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/your-team/cafe-mern.git
cd cafe-mern
```

2. Install dependencies
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

3. Set up environment variables
```bash
# Populate .env.example for database
cp backend/.env.example backend/.env
```

4. Start development servers
```bash
# Terminal 1 - Backend (http://localhost:5000)
cd backend
npm run start

# Terminal 2 - Frontend (http://localhost:3000)
cd frontend
npm run dev
```

5. Open your browser
```
Visit: http://localhost:3000
```

## 📚 Documentation

- [Project Setup Guide](./docs/SETUP.md)
- [API Documentation](./docs/API.md)
- [Database Schema](./docs/DATABASE.md)
- [Deployment Guide](./docs/DEPLOYMENT.md)
- [Contributing Guidelines](./CONTRIBUTING.md)
- [Code Style  with Agents Guide](./docs/AGENTS_USAGE.md)
- [Rules for AI Agents](./docs/AGENTS.MD)

## 🛠️ Tech Stack

### Frontend
- **Nextjs(React)** - React UI library with Next SEO tools
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling

### Backend
- **Node.js** - Runtime
- **Express** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM

### DevOps
- **Docker** - Containerization
- **GitHub Actions** - CI/CD
- **Render** - Full-stack hosting service
- **MongoDB Atlas** - Database hosting

## 📁 Project Structure
```
MERN-Project/
├── backend/                     # Express backend
│   ├── controllers/             # Route controllers
│   ├── models/                  # Mongoose models
│   ├── routes/                  # API routes
│   ├── middleware/              # Custom middleware
│   ├── utils/                   # Utility functions
│   └── server.ts                # Entry point
│
├── docs/                        # Documentation
│    ├── API.md
│    ├── DATABASE.md
│    ├── DEPLOYMENT.md
│    ├── AGENTS_USAGE.md
│    ├── AGENTS.md
│    └── SETUP.md
│    
├── frontend/                    # React frontend (Hybrid: Client, SSR, SSG)
│   ├── .next                    # dist
│   ├── node_modules
│   ├── public                   
│   ├── src/
│   │   ├── app/         
│   │       ├── components/      # React components
│   │       ├── favicon.ico      # Favico
│   │       ├── Layout.tsx       # HTML for SSG
│   │       ├── page.tsx         # Landing Page
│   │       └── globals.css      # Global styles
├── .gitignore
├── Dockerfile
├── nginx.conf
└── README.md

```

## 👥 Team Members

| Name | Role | GitHub | Email |
|------|------|--------|-------|
| Khaesey Angel G. Tablante | Project Lead Developer & Backend | [@Khaeshi](https://github.com/Khaeshi) | kagtabss@gmail.com |
--> insert

## 🙏 Acknowledgments

- [Unsplash](https://unsplash.com) - Stock images *temporary*
- [Heroicons](https://heroicons.com) - Icon library

## 📧 Contact

For questions or feedback, please reach out to:
- Email: kagtabss@gmail.com
- GitHub Issues: [Create an issue](https://github.com/your-team/cafe-mern/issues)

---
