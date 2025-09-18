# Organization Scheduler API

## 🏢 Project Overview

This project is a robust Organization Scheduler API built with Node.js, Express, and MongoDB. It provides a RESTful interface for managing organizations, users (Admins, Managers, and Members), schedules, and queries related to schedules/tasks. The API is designed with role-based access control (RBAC) to ensure that users can only perform actions relevant to their assigned roles and permissions.

## Features

*   **Authentication & Authorization:** Secure user login/logout with JWT tokens, protected routes, and role-based access control (Admin, Manager, Member).
*   **Organization Management:** Register and delete organizations.
*   **User Management:**
    *   **Admins:** Manage all users (create, update, delete) within their organization.
    *   **Managers:** Create, list, update, and remove Members under their supervision.
    *   **Members:** View and update their own profile and password.
*   **Task Management:**
    *   **Admins/Managers:** Create, view (managed tasks), update (except status/creator), and delete tasks.
    *   **Members:** View their assigned tasks, update task status.
    *   All authenticated users can view tasks they are associated with.
*   **Query Management:**
    *   Raise queries related to tasks.
    *   Add, retrieve, edit, and delete responses to queries.
    *   Mark queries as resolved.

## 🛠️ Technologies Used

*   **Node.js**: JavaScript runtime.
*   **Express.js**: Web application framework for Node.js.
*   **MongoDB**: NoSQL database.
*   **Mongoose**: MongoDB object data modeling (ODM) library for Node.js.
*   **JSON Web Tokens (JWT)**: For authentication.
*   **Bcrypt**: For password hashing.
*   **Dotenv**: To manage environment variables.
*   **Cookie-parser**: Middleware for parsing HTTP cookies.
*   **CORS**: Middleware for enabling Cross-Origin Resource Sharing.
*   **Morgan**: HTTP request logger middleware.
*   **express-validator**: For input validation (implied by `inputValidators` and `queryValidator`).

## 📂 Project Structure

```
.                
├── controllers/
│   ├── admin.controller.js   # Logic for Admin-specific user actions
│   ├── auth.controller.js    # Logic for user authentication (login, logout)
│   ├── member.controller.js  # Logic for Member-specific actions (self-profile, password)
│   ├── manager.controller.js # Logic for Manager-specific user actions (managing members)
│   ├── organization.controller.js # Logic for organization registration/deletion
│   ├── query.controller.js   # Logic for query creation, responses, resolution
│   └── task.controller.js    # Logic for task creation, retrieval, update, deletion
├── middleware/
│   ├── authMiddleware.js     # JWT verification and role-based access control
│   ├── IdValidate.js         # Middleware for validating MongoDB IDs in parameters
│   └── validate.js           # Generic input validation middleware (collects errors from Joi validators)
├── models/
│   ├── User.js               # Mongoose schema for User
│   ├── Organization.js       # Mongoose schema for Organization
│   ├── Task.js               # Mongoose schema for Task
│   └── Query.js              # Mongoose schema for Query
├── routes/
│   ├── auth.routes.js        # Authentication related routes
│   ├── organization.routes.js # Organization management routes
│   ├── query.routes.js       # Query specific routes (nested under task routes)
│   ├── task.routes.js        # Task specific routes (nested under user routes)
│   └── user.routes.js        # User management and profile routes (nests task routes)
├── services/
│   ├── admin.service.js      # Business logic for Admin actions
│   ├── auth.service.js       # Business logic for authentication
│   ├── member.service.js     # Business logic for Member actions
│   ├── manager.service.js    # Business logic for Manager actions
│   ├── organization.service.js # Business logic for organization management
│   ├── query.service.js      # Business logic for query management
│   └── task.service.js       # Business logic for task management
├── validator/
│   ├── inputValidators.js    # Joi schemas for general user/auth input validation
│   ├── queryValidator.js     # Joi schemas for query input validation
│   └── taskInputValidators.js # Joi schemas for task input validation
├── .env.example              # Example environment variables
├── .gitignore                # Files/folders to ignore from Git
├── package.json              # Project dependencies and scripts
├── server.js                 # Main application entry point
|── db.js                     # MongoDB connection setup
└── README.md                 # Project README file (this file)
```

## Getting Started

### Prerequisites

*   Node.js (LTS recommended)
*   MongoDB instance (local or cloud-hosted)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository_url>
    cd task-management-api
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Create `.env` file:**
    Copy the `.env.example` file and rename it to `.env`. Fill in your environment variables:
    ```
    # .env
    NODE_ENV=development
    PORT=5000
    MONGODB_URI=mongodb://localhost:27017/your_task_manager_db
    JWT_SECRET=YOUR_VERY_STRONG_AND_RANDOM_SECRET_KEY
    JWT_LIFETIME=1h
    CLIENT_URL=http://localhost:3000 # Your frontend URL if applicable
    ```
    **Note:** Replace `YOUR_VERY_STRONG_AND_RANDOM_SECRET_KEY` with a secure, long, random string.

4.  **Start the server:**
    ```bash
    npm start
    # or for development with hot-reloading
    npm run dev
    ```
    The API should now be running on `http://localhost:5000` (or your specified `PORT`).

## API Endpoints

All API endpoints are prefixed with `/api`.

### 1. 🔐 Authentication Routes (`/api/auth`)

| Method | Endpoint    | Description                     | Access   | Controller          |
| :----- | :---------- | :------------------------------ | :------- | :------------------ |
| `POST` | `/login`    | Authenticates a user            | Public   | `authController.login` |
| `POST` | `/logout`   | Logs out the current user       | Authenticated | `authController.logout` |
| `POST` | `/forgot-password` (Optional) | Initiates password reset process | Public   | `authController.forgotPassword` |
| `POST` | `/reset-password` (Optional) | Resets user password            | Public   | `authController.resetPassword` |

### 2. 🏢 Organization Routes (`/api/orgs`)

| Method | Endpoint    | Description                     | Access        | Controller          |
| :----- | :---------- | :------------------------------ | :------------ | :------------------ |
| `POST` | `/register` | Registers a new organization and its Admin | Public        | `organizationController.register` |
| `DELETE` | `/:orgId`   | Deletes an organization         | Admin (of that org) | `organizationController.deleteOrg` |

### 3.👥 User Routes (`/api/users`)

This router includes nested routes for tasks (`/api/users/tasks`).

#### Member-Specific Actions (`/api/users`)

| Method | Endpoint         | Description                         | Access      | Controller              |
| :----- | :--------------- | :---------------------------------- | :---------- | :---------------------- |
| `GET`  | `/me`            | Get current user's profile          | Authenticated | `memberControllers.getOwnProfile` |
| `PUT`  | `/me`            | Update current user's profile (name, avatar) | Authenticated | `memberControllers.updateOwnProfile` |
| `PUT`  | `/me/password`   | Update current user's password      | Authenticated | `memberControllers.updateOwnPassword` |

#### Manager-Specific Actions (`/api/users/members`)

| Method | Endpoint         | Description                         | Access   | Controller              |
| :----- | :--------------- | :---------------------------------- | :------- | :---------------------- |
| `GET`  | `/members`       | List all members under manager's supervision | Manager  | `managerControllers.getMembers` |
| `POST` | `/members`       | Create a new member                 | Manager  | `managerControllers.createMember` |
| `PUT`  | `/members/:userId` | Update a member's info              | Manager  | `managerControllers.updateMember` |
| `DELETE` | `/members/:userId` | Remove a member (delete user)      | Manager  | `managerControllers.removeMember` |

#### Admin-Specific Actions (`/api/users`)

| Method | Endpoint         | Description                         | Access   | Controller            |
| :----- | :--------------- | :---------------------------------- | :------- | :-------------------- |
| `GET`  | `/all-users`     | Get all users in the organization   | Admin    | `adminControllers.getAllUsersInOrg` |
| `PUT`  | `/:userId`       | Update any user's info              | Admin    | `adminControllers.updateAnyUser` |
| `DELETE` | `/:userId`       | Delete any user                     | Admin    | `adminControllers.deleteAnyUser` |
| `POST` | `/add`           | Create any user (Member/Manager)    | Admin    | `adminControllers.createUser` |

### 4. 📅 Task Routes (`/api/users/tasks`)

These routes are nested under the `/api/users` path.

| Method | Endpoint             | Description                         | Access        | Controller           |
| :----- | :------------------- | :---------------------------------- | :------------ | :------------------- |
| `POST` | `/`                  | Create a new task                   | Manager/Admin | `taskController.createTask` |
| `GET`  | `/managed`           | Get tasks created/managed by current user | Manager/Admin | `taskController.getManagedTasks` |
| `GET`  | `/my`                | Get tasks assigned to current user  | Authenticated | `taskController.getTasksAssignedToMe` |
| `GET`  | `/:taskId`           | Get a specific task by ID           | Authenticated (involved in task) | `taskController.getTaskById` |
| `PUT`  | `/my/:taskId`        | Update a task (excludes status/creator) | Manager/Admin (creator or assignee) | `taskController.updateTask` |
| `PATCH`| `/:taskId/status`    | Update only task status             | Any assigned user | `taskController.updateTaskStatus` |
| `DELETE` | `/:taskId`           | Delete a task                       | Creator/Admin | `taskController.deleteTask` |

### 5. ❓ Query Routes (`/api/users/tasks/:taskId/queries`)

These routes are nested under the `/api/users/tasks/:taskId` path.

| Method | Endpoint                   | Description                         | Access        | Controller           |
| :----- | :------------------------- | :---------------------------------- | :------------ | :------------------- |
| `POST` | `/`                        | Raise a new query for a task        | Member/Manager | `queryController.raiseQuery` |
| `GET`  | `/`                        | Get all queries for a specific task | Authenticated (involved in task) | `queryController.getQueriesByTask` |
| `POST` | `/:queryId/responses`      | Add a response to a query           | Authenticated (involved in task) | `queryController.addResponse` |
| `GET`  | `/:queryId/responses`      | Get all responses for a query       | Authenticated (involved in task) | `queryController.getResponses` |
| `DELETE` | `/:queryId/responses/:responseId` | Delete a response for a query       | Responder/Admin | `queryController.deleteResponse` |
| `PATCH`| `/:queryId/responses/:responseId` | Update a response for a query       | Responder/Admin | `queryController.editResponse` |
| `PATCH`| `/:queryId/resolve`        | Mark a query as resolved            | Query raiser/Admin | `queryController.resolveQuery` |
| `DELETE` | `/:queryId`                | Delete a query                      | Query raiser/Admin | `queryController.deleteQuery` |

## Authentication and Authorization Flow

1.  **User Login:** A user sends a `POST` request to `/api/auth/login` with `email` and `password`.
2.  **JWT Issuance:** If credentials are valid, the server issues a JWT, signs it with `JWT_SECRET`, and sets it as an `httpOnly` cookie named `token`.
3.  **Protected Routes:** For subsequent requests to protected routes, the `authToken` middleware extracts the JWT from the cookie, verifies it, and attaches the decoded user payload (`req.user`) to the request.
4.  **Role-Based Access Control:**
    *   `authUser` middleware ensures the user is authenticated.
    *   `authManager` ensures the user is authenticated AND has the "Manager" role.
    *   `authAdmin` ensures the user is authenticated AND has the "Admin" role.
    *   `roleMiddleware(["Role1", "Role2"])` allows access only if the user has one of the specified roles.
    *   Additionally, controllers and services implement fine-grained authorization logic (e.g., a manager can only manage members under their supervision, a user can only update their own password).

## How to Test

You can use tools like Postman, Insomnia, or write client-side code to interact with the API.

**Example Flow:**

1.  **Register an Organization and Admin:**
    *   `POST /api/orgs/register`
    *   Body: `{ "orgName": "MyCompany", "adminName": "Org Admin", "email": "admin@mycompany.com", "password": "securepassword" }`
2.  **Admin Login:**
    *   `POST /api/auth/login`
    *   Body: `{ "email": "admin@mycompany.com", "password": "securepassword" }`
    *   This will set a `token` cookie.
3.  **Admin Creates a Manager:**
    *   `POST /api/users/add` (with `token` cookie)
    *   Body: `{ "name": "Manager One", "email": "manager1@mycompany.com", "password": "managerpass", "role": "Manager" }`
4.  **Manager Login:**
    *   `POST /api/auth/login`
    *   Body: `{ "email": "manager1@mycompany.com", "password": "managerpass" }`
    *   This will set a new `token` cookie for the Manager.
5.  **Manager Creates a Member:**
    *   `POST /api/users/members` (with `token` cookie for Manager)
    *   Body: `{ "name": "Member One", "email": "member1@mycompany.com", "password": "memberpass" }` (role will default to "Member")
6.  **Manager Creates a Task:**
    *   `POST /api/users/tasks` (with `token` cookie for Manager)
    *   Body: `{ "title": "Implement Feature X", "description": "Develop the XYZ feature for the app.", "assignedTo": ["<member1_userId>"], "timeline": "2023-12-31T00:00:00.000Z" }`
7.  **Member Login:**
    *   `POST /api/auth/login`
    *   Body: `{ "email": "member1@mycompany.com", "password": "memberpass" }`
8.  **Member Views Their Tasks:**
    *   `GET /api/users/tasks/my` (with `token` cookie for Member)
9.  **Member Raises a Query on a Task:**
    *   `POST /api/users/tasks/<taskId>/queries` (with `token` cookie for Member)
    *   Body: `{ "message": "How should I handle error condition ABC?" }`

---
