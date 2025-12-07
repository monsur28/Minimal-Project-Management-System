# MPMS Backend

The **Minimal Project Management System (MPMS)** backend is a robust RESTful API built with **Node.js**, **Express**, and **MongoDB**. It powers the MPMS frontend with secure authentication, task management, and file handling capabilities.

## 🚀 Tech Stack

- **Runtime**: [Node.js](https://nodejs.org/)
- **Framework**: [Express.js](https://expressjs.com/)
- **Database**: [MongoDB](https://www.mongodb.com/) (Mongoose ODM)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Validation**: [Zod](https://zod.dev/)
- **Authentication**: JWT & BcryptJS
- **Security**: Helmet, CORS
- **Logging**: Morgan
- **File Uploads**: Multer
- **Environment**: Dotenv

## 📂 Project Structure

```bash
src/
├── config/           # Database and other configurations
├── controllers/      # Request handlers (Auth, Project, Task, etc.)
├── middleware/       # Auth checks, error handling, validation
├── models/           # Mongoose schemas (User, Project, Task, etc.)
├── routes/           # API route definitions
├── types/            # TypeScript type definitions
├── utils/            # Helper functions
├── seeder.ts         # Database seeder script
└── server.ts         # Entry point
```

## 🔑 Key Features

- **Authentication**: User registration and login with JWT-based sessions.
- **Resource Management**: CRUD operations for Projects, Sprints, and Tasks.
- **Sub-resources**: Management of Subtasks, Comments, and Attachments.
- **File Uploads**: Handle file attachments for tasks.
- **Validation**: Strict request validation using Zod schemas.
- **Seeding**: Script to populate the database with initial test data.

## 📡 API Endpoints

### Auth
- `POST /api/auth/register` - potentially disabled or for admin use
- `POST /api/auth/login` - Authenticate user

### Projects
- `GET /api/projects` - List all projects
- `POST /api/projects` - Create a new project
- `GET /api/projects/:id` - Get project details
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Sprints
- `POST /api/sprints` - Create a sprint
- `GET /api/sprints` - List sprints
- `PUT /api/sprints/:id` - Update sprint

### Tasks
- `POST /api/tasks` - Create a task
- `GET /api/tasks` - List tasks
- `GET /api/tasks/:id` - Get task details
- `PUT /api/tasks/:id` - Update task (status, assignees, etc.)
- `DELETE /api/tasks/:id` - Delete task

### Comments
- `GET /api/tasks/:taskId/comments` - Get comments for a task
- `POST /api/tasks/:taskId/comments` - Add a comment

### Users
- `GET /api/users` - List users (for assignment)

### Uploads
- `POST /api/upload` - Upload file

## 🛠️ Getting Started

1.  **Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Environment Setup**:
    Create a `.env` file in the root:
    ```env
    PORT=5000
    MONGO_URI=your_mongodb_connection_string
    JWT_SECRET=your_jwt_secret
    ```

3.  **Seed Database** (Optional):
    ```bash
    npm run data:import
    ```

4.  **Run Development Server**:
    ```bash
    npm run dev
    ```

## 🧪 Scripts

- `npm run dev`: Start server with Nodemon.
- `npm start`: Start compiled server.
- `npm run build`: Compile TypeScript.
- `npm run data:import`: Import seed data.
- `npm run data:destroy`: Destroy all data.
