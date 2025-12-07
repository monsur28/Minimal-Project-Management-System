# MPMS Frontend

The **Minimal Project Management System (MPMS)** frontend is built with **Next.js 16** and **React 19**, offering a modern, dark-themed interface for managing projects, sprints, tasks, and teams.

## 🚀 Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Library**: [React 19](https://react.dev/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **UI Components**: [Shadcn UI](https://ui.shadcn.com/) / [Radix UI](https://www.radix-ui.com/)
- **State Management**: [TanStack Query (React Query)](https://tanstack.com/query/latest)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Forms**: [React Hook Form](https://react-hook-form.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Http Client**: [Axios](https://axios-http.com/)
- **Toasts**: [Sonner](https://sonner.emilkowal.ski/)
- **Date Handling**: [date-fns](https://date-fns.org/)
- **Drag & Drop**: [@dnd-kit](https://dndkit.com/)

## 📂 Project Structure

```bash
src/
├── app/              # App Router pages and layouts
│   ├── dashboard/    # Admin/Manager Dashboard (Projects, Tasks, Team)
│   ├── panel/        # Member Panel (Tasks list, Settings)
│   ├── layout.tsx    # Root layout with providers (Auth, Query)
│   └── page.tsx      # Login Page
├── components/       # Reusable UI components
│   ├── ui/           # Shadcn UI primitives (Button, Card, Input, etc.)
│   ├── tasks/        # Task-specific components (Dialogs, Comments, Forms)
│   └── ...           # Other feature components
├── context/          # React Contexts (AuthContext)
├── lib/              # Utilities (axios instance, query provider, utils)
└── ...
```

## ✨ Features

- **Authentication**: Secure login with JWT.
- **Role-Based Access**:
  - **Admin**: Full access to create projects, sprints, and manage teams.
  - **Member**: View assigned tasks, update status, and track time.
- **Dashboard**:
  - **Project Management**: Create and track projects.
  - **Sprint Planning**: Organize tasks into sprints.
  - **Task Board**: Kanban-style or list view of tasks.
  - **Team Management**: Manage users and roles.
- **Interactive Tasks**:
  - **Drag & Drop**: Reorder tasks (if implemented).
  - **Comments**: Real-time discussions on tasks.
  - **Attachments**: File uploads for tasks.
  - **Progress Tracking**: Visual progress bars and status updates.
- **Dark Mode**: Sleek, immersive dark UI by default.
- **Responsive**: Fully responsive design for all devices.

## 🛠️ Getting Started

1.  **Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Run Development Server**:
    ```bash
    npm run dev
    ```

3.  **Open Browser**:
    Visit [http://localhost:3000](http://localhost:3000)

## 📝 Configuration

- **Environment Variables**:
  - Ensure the backend URL is correctly configured in your axios instance (usually `src/lib/axios.ts` or via `.env.local` if applicable).

## 🧪 Scripts

- `npm run dev`: Start dev server.
- `npm run build`: Build for production.
- `npm run start`: Start production server.
- `npm run lint`: Run ESLint.
