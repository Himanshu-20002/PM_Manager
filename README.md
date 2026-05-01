# PM_Manager - Project & Task Management

A production-ready full-stack Team Task Manager built with Next.js (App Router), MongoDB, and TypeScript.

## Features

- **Authentication**: JWT-based auth with HTTP-only cookies.
- **Role-based Access**: 
  - **Admin**: Create projects, assign tasks, delete tasks.
  - **Member**: View projects/tasks, update task status.
- **Project Detail**: View specific project info and its associated tasks.
- **Dashboard**: Real-time stats (Total, Completed, Overdue tasks).
- **Modern UI**: Built with Tailwind CSS, Lucide icons, and responsive layouts.
- **Visual Indicators**: Highlight overdue tasks and status badges.

## Tech Stack

- **Frontend/Backend**: Next.js (App Router)
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose
- **Validation**: Zod
- **Styling**: Tailwind CSS
- **Auth**: `jose` (JWT) & `bcryptjs` (Hashing)

## Setup Instructions

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd pm_manager
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env.local` file in the root directory:
   ```env
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_super_secret_jwt_key
   NODE_ENV=development
   ```

4. **Run the development server**:
   ```bash
   npm run dev
   ```

5. **Access the app**:
   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment Variables

- `MONGODB_URI`: Your MongoDB connection string.
- `JWT_SECRET`: A secret string used to sign JWT tokens.
- `NODE_ENV`: Set to `development` or `production`.

## Deployment

The app is ready to be deployed on **Vercel** or **Railway**. 
Ensure you set the environment variables in your deployment platform's dashboard.

## Project Structure

- `/app`: API routes and Page components.
- `/components`: Reusable UI and Feature components.
- `/lib`: Database connection and Auth helpers.
- `/models`: Mongoose schemas for User, Project, and Task.
- `/validators`: Zod schemas for request validation.
- `/types`: TypeScript interfaces.
- `/utils`: Common utility functions.
