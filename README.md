# PM Manager - High Performance Project Management

A professional, full-stack Project & Task Management system built with **Next.js (App Router)**, **MongoDB**, and **TypeScript**. Optimized for high-performance real-time synchronization and lightweight server loads.

## 🚀 Key Features

### 📡 Smart Sync Engine
- **Visibility-Aware Polling**: Background sync heartbeats automatically pause when the tab is hidden to save server resources.
- **Focus-Driven Refresh**: Data refreshes instantly the moment you switch back to the application.
- **Optimistic UI**: Task state transitions (Start/Done/Move) happen with **0ms latency** on the client side.

### 🎮 Gamified Experience
- **Member Progression**: Integrated Level and XP system that tracks contribution and task completion.
- **Visual Progress**: Color-coded project completion bars and dynamic task state labels.

### 🛠 Management Tools
- **Advanced Kanban**: Project-specific boards with custom stages and drag-less state transitions.
- **Role-Based Security**: Strict access control for Team Leaders (Admins) and Members.
- **Team Synchronization**: Admin tools to automatically sync organization members into new projects.

### 🏥 Production Ready
- **Health Monitoring**: Integrated `/api/health` endpoint for real-time database and server status.
- **Optimized for Vercel**: Built-in edge-compatible JWT authentication and database connection pooling.

## 💻 Tech Stack

- **Framework**: Next.js (App Router)
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose
- **Styling**: Tailwind CSS & Framer Motion
- **Security**: `jose` (JWT) & `bcryptjs`
- **Validation**: Zod

## 🛠 Setup Instructions

1. **Clone & Install**:
   ```bash
   git clone <repository-url>
   cd pm_manager
   npm install
   ```

2. **Environment Configuration**:
   Create a `.env.local` file:
   ```env
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_super_secret_jwt_key
   NODE_ENV=development
   ```

3. **Development**:
   ```bash
   npm run dev
   ```

## 🏗 Project Structure

- `/app`: Pages, API routes, and layouts.
- `/components`: UI primitives and feature-specific components.
- `/lib`: Global DataContext, Session management, and DB helpers.
- `/models`: Database schemas (User, Project, Task, Team).
- `/validators`: Request validation logic.

## 📊 Monitoring
Monitor your deployment status at: `https://your-app-url.com/api/health`
