# Full-Stack To-Do App (React + Node.js + Express + MongoDB)

This project combines the requirements from:
- Practical No. 8: React frontend, Express/Node backend, MongoDB, API communication, add/read/update/delete and mark completed.
- Practical No. 10: Git/GitHub version control and deployment-ready configuration for Render (backend) and Vercel (frontend).

## Requirements
- Node.js 18+ (recommended)
- MongoDB local Community Server OR a MongoDB Atlas cluster
- Git

## Folder structure
```text
todo-app-mern/
├── backend/
│   ├── models/Todo.js
│   ├── routes/todos.js
│   ├── server.js
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/App.jsx
│   ├── src/main.jsx
│   ├── src/index.css
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   └── .env.example
├── .gitignore
└── README.md
```

## 1. Configure MongoDB
### Option A: MongoDB Atlas (recommended for deployment)
1. Create a cluster at https://www.mongodb.com/atlas.
2. Create a database user and allow your IP in Network Access (for a temporary learning setup, Atlas may allow `0.0.0.0/0`; use carefully).
3. Copy the Node.js connection string.
4. Put it in `backend/.env` as `MONGODB_URI=...`, replacing the username, password and database name. URL-encode special characters in the password.

### Option B: Local MongoDB
Install and start MongoDB Community Server, then use:
`MONGODB_URI=mongodb://127.0.0.1:27017/todo_app`

## 2. Run locally
Open a terminal in the project root.

Terminal 1 — backend:
```bash
cd backend
npm install
```
Copy `.env.example` to `.env`, then set `MONGODB_URI`.
```bash
npm run dev
```
Backend runs at http://localhost:5000. Health check: http://localhost:5000/api/health

Terminal 2 — frontend:
```bash
cd frontend
npm install
```
Copy `.env.example` to `.env` (default API URL is already local).
```bash
npm run dev
```
Open the Vite URL printed in the terminal, usually http://localhost:5173.

## 3. Push to GitHub
Create an empty repository on GitHub, then from the project root:
```bash
git init
git add .
git commit -m "Build full stack To-Do app with MongoDB"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
git push -u origin main
```
Replace the URL with your actual repository URL. Do not commit `.env` files or database credentials.

## 4. Deploy backend to Render
1. Push the repository to GitHub.
2. In Render, create **New + → Web Service** and select the repository.
3. Set **Root Directory** to `backend`.
4. Build command: `npm install`
5. Start command: `npm start`
6. Add environment variables:
   - `MONGODB_URI` = your Atlas connection string
   - `CLIENT_URL` = your Vercel frontend URL (after frontend deploy; temporarily you can use `http://localhost:5173` for local work)
   - `NODE_ENV` = `production`
7. Deploy and copy the public backend URL, for example `https://your-api.onrender.com`.

## 5. Deploy frontend to Vercel
1. Import the same GitHub repository into Vercel.
2. Set **Root Directory** to `frontend`.
3. Framework: Vite. Build command: `npm run build`. Output directory: `dist`.
4. Add environment variable `VITE_API_URL` = your Render backend base URL, with no `/api` suffix, e.g. `https://your-api.onrender.com`.
5. Deploy and copy the frontend URL.

## 6. Finish CORS configuration
In Render, set `CLIENT_URL` to the exact Vercel origin, e.g. `https://your-todo-app.vercel.app`, without a trailing slash. Save and redeploy/restart the backend.

If you change `VITE_API_URL` in Vercel, redeploy the frontend.

## CRUD features
- Create a task
- Read/list tasks
- Edit task title
- Mark task complete/incomplete
- Delete task
- Filter all / active / completed
- Counts for total, active and completed
- MongoDB persistence

## Troubleshooting
- `Failed to fetch`: confirm the backend is running and `VITE_API_URL` points to the backend, not the frontend; inspect browser console and backend logs.
- MongoDB connection error: check `MONGODB_URI`, Atlas database user/password and Network Access.
- CORS error: set Render `CLIENT_URL` to the exact frontend URL and redeploy.
- Port conflict: change `PORT` only if needed; Render supplies it automatically.
## Practical 10
Git and GitHub integration for the MERN To-Do App.