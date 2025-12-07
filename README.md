# Minimal Project Management System (MPMS)

Welcome to **MPMS**, a modern, full-stack project management solution designed for efficiency and clarity. Built with a futuristic dark-themed UI, it enables teams to manage projects, plan sprints, and track tasks seamlessly.

## 🌟 Overview

MPMS is composed of two main applications:
1.  **Frontend**: A responsive Next.js web application for the user interface.
2.  **Backend**: A robust Express.js API handling data, authentication, and logic.

## 🏗️ Architecture

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS 4, Shadcn UI.
- **Backend**: Node.js, Express, MongoDB, TypeScript.

## 🚀 Quick Start Guide

To get the entire system up and running locally, follow these steps:

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+ recommended)
- [MongoDB](https://www.mongodb.com/) (Local or Atlas)

### 1. Backend Setup
Navigate to the `backend` directory and start the API server:

```bash
cd backend

# Install dependencies
npm install

# Setup Environment Variables
# Create a .env file with:
# PORT=5000
# MONGO_URI=mongodb://localhost:27017/mpms
# JWT_SECRET=your_secret_key

# Seed Database (Optional)
npm run data:import

# Start Development Server
npm run dev
```
 The backend will run on `http://localhost:5000`.

### 2. Frontend Setup
Navigate to the `frontend` directory and start the client application:

```bash
cd frontend

# Install dependencies
npm install

# Start Development Server
npm run dev
```
The frontend will run on `http://localhost:3000`.

## 📚 Documentation

For more detailed information about each part of the system, please refer to the specific README files:

- [**Frontend Documentation**](./frontend/README.md)
- [**Backend Documentation**](./backend/README.md)

## ✨ key Capabilities

- **Role-Based Dashboards**: Distinct views for Admins and Team Members.
- **Sprint Management**: Organize work into actionable sprints.
- **Task Tracking**: Detailed task views with status, priority, and estimates.
- **Team Collaboration**: Real-time comments and file attachments on tasks.
- **Modern UI**: Fully responsive, accessible, and aesthetically pleasing dark mode.

---
© 2025 MPMS. All rights reserved.
