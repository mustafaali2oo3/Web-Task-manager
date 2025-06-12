# TaskFlow - Task Management Application

TaskFlow is a comprehensive task management application that allows users to create, manage, and organize tasks efficiently.

## Core Functionality

### 1. User Authentication System
- ✅ User registration with email and password
- ✅ User login/logout functionality
- ✅ Password hashing and security (handled by Supabase Auth)
- ✅ Protected routes that require authentication (via middleware)

### 2. Task Management Features
- ✅ Create new tasks with title, description, due date, and priority level
- ✅ View all tasks in a clean, organized interface
- ✅ Edit existing tasks
- ✅ Delete tasks
- ✅ Mark tasks as completed/incomplete (via status changes)
- ✅ Filter tasks by status and priority
- ✅ Organize tasks by projects

### 3. User Interface Requirements
- ✅ Responsive design that works on desktop and mobile
- ✅ Clean, intuitive user interface with dark mode
- ✅ Loading states for async operations
- ✅ Error handling and user feedback messages (toast notifications)
- ✅ Form validation

## Technical Implementation

This application uses a modern tech stack:

### Frontend
- **Next.js** (React framework) with App Router
- **Tailwind CSS** for styling
- **React Hooks** for state management
- **ShadCN UI** components

### Backend
- **Supabase** for authentication, database, and real-time updates
- **Server Components** and **Server Actions** for data fetching and mutations
- **Middleware** for route protection

### Database
- **PostgreSQL** (via Supabase)
- Relational data model with proper relationships between users, tasks, and projects
- Row-level security policies for data protection

## Getting Started

1. Clone this repository
2. Install dependencies: `npm install`
3. Set up environment variables (see `.env.example`)
4. Run the development server: `npm run dev`
5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Environment Variables

Create a `.env.local` file with the following variables:

\`\`\`
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
\`\`\`

## Database Schema

The application uses the following database schema:

- **profiles**: User profile information
- **tasks**: Task data with references to users and projects
- **projects**: Project data with references to users
\`\`\`

Now, let's enhance our authentication system to ensure it meets all requirements:
