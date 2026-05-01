# Team Task Manager

This is a Full-Stack Team Task Management application built using the MERN stack (MongoDB, Express, React, Node.js).
It meets all the requirements for the assignment.

## Features Included:
- **Authentication:** Signup & Login functionality with JWT.
- **Project & Team Management:** Admin can create projects. Users can view projects they are a part of.
- **Task Tracking:** Create, assign, and track tasks (Todo, In Progress, Done). Tasks have descriptions and due dates.
- **Role-Based Access Control:** 'Admin' and 'Member' roles. Only admins can create projects and tasks. Members can update tasks assigned to them.
- **Dashboard:** Overview of tasks with status, and highlighting for overdue items.

## Local Setup

### 1. Database
You need a MongoDB connection string. You can use a local instance or MongoDB Atlas.

### 2. Backend Setup
1. `cd backend`
2. Create a `.env` file with the following variables:
   ```
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   ```
3. Run `npm install`
4. Run `npm start` (or `npm run dev` if you add nodemon)

### 3. Frontend Setup
1. `cd frontend`
2. Create a `.env` file (if you want to override the default API URL):
   ```
   VITE_API_URL=http://localhost:5000/api
   ```
3. Run `npm install`
4. Run `npm run dev`

## Railway Deployment Instructions (Step-by-Step)
This project is configured to be deployed as a monolithic full-stack app on Railway.

1. **Create a GitHub Repository:** Push the entire code (`backend`, `frontend`, and root `package.json`) to a new GitHub repo.
2. **Create a Railway Account:** Go to [railway.app](https://railway.app/) and sign in.
3. **New Project:** Click "New Project" -> "Deploy from GitHub repo".
4. **Select Repository:** Select the repo you just created.
5. **Environment Variables:** In Railway, go to the project settings -> Variables, and add the following:
   - `NODE_ENV`: `production`
   - `MONGO_URI`: (Your MongoDB connection string from Atlas)
   - `JWT_SECRET`: (A random string for JWT hashing)
6. **Build & Deploy:** Railway will automatically use the root `package.json`. It will run `npm run build` which installs dependencies and builds the React frontend, and then it will run `npm start` which starts the Node server and serves the compiled frontend statically.
7. **Get Live URL:** Once deployed, click on the domain that Railway generated to access your live application.


