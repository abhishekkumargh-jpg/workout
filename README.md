# 🏋️ FitTrack — Daily Workout Progress Tracker

A full-stack web application to log daily workouts, track exercises with sets/reps/weight, and visualize your strength progress over time with interactive charts.

---

## 🚀 Features

- **Dashboard** — Stat cards (total workouts, streak, volume, weekly sessions), muscle-volume bar chart, weekly activity chart, and recent workout list
- **Log Workout** — Searchable exercise picker, sets/reps/weight input per exercise, notes, and duration
- **Progress Charts** — Weight progression (line chart) and volume per session (bar chart) for any exercise
- **Exercise Library** — 28 built-in exercises, filter by muscle group, search, add/delete custom exercises

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19 + Vite 7 |
| **Charts** | Recharts |
| **Routing** | React Router v7 |
| **HTTP Client** | Axios |
| **Backend** | Node.js + Express.js |
| **Database** | SQLite3 (`better-sqlite3`) |
| **Styling** | Vanilla CSS (dark glassmorphism theme) |

---

## 📁 Project Structure

```
miniproject/
├── server/                 # Backend API
│   ├── index.js            # Express server entry point
│   ├── db.js               # SQLite setup & seed data
│   └── routes/
│       ├── workouts.js     # CRUD for workouts
│       ├── exercises.js    # Exercise library API
│       └── progress.js     # Stats & chart data
│
└── client/                 # React frontend
    └── src/
        ├── api.js          # Axios API client
        ├── App.jsx         # Router & layout
        ├── components/
        │   └── Navbar.jsx
        └── pages/
            ├── Dashboard.jsx
            ├── LogWorkout.jsx
            ├── Progress.jsx
            └── ExerciseLibrary.jsx
```

---

## ⚙️ Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) v18+
- npm

### Installation & Running

**1. Clone the repository**
```bash
git clone https://github.com/abhishekkumargh-jpg/workout.git
cd workout
```

**2. Start the Backend**
```bash
cd server
npm install
node index.js
# → Server running at http://localhost:3001
```

**3. Start the Frontend** *(new terminal)*
```bash
cd client
npm install
npm run dev
# → App running at http://localhost:5173
```

**4. Open in browser**
```
http://localhost:5173
```

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/workouts` | Get all workouts |
| `POST` | `/api/workouts` | Create a workout |
| `DELETE` | `/api/workouts/:id` | Delete a workout |
| `GET` | `/api/exercises` | Get all exercises |
| `POST` | `/api/exercises` | Add custom exercise |
| `GET` | `/api/progress/exercise/:id` | Progress chart data |
| `GET` | `/api/progress/summary` | Dashboard stats |

---

## 🏃 Exercise Categories

**28 built-in exercises** across 7 muscle groups:

`Chest` · `Back` · `Legs` · `Shoulders` · `Biceps` · `Triceps` · `Core`

---

## 📦 Scripts

```powershell
# Backend
cd server; node index.js

# Frontend
cd client; npm run dev

# Build for production
cd client; npm run build
```

---

## 📄 License

MIT © 2026 abhishekkumargh-jpg
