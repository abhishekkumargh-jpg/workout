import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import LogWorkout from './pages/LogWorkout';
import Progress from './pages/Progress';
import ExerciseLibrary from './pages/ExerciseLibrary';
import './index.css';

export default function App() {
  return (
    <BrowserRouter>
      <div className="app-layout">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/log" element={<LogWorkout />} />
            <Route path="/progress" element={<Progress />} />
            <Route path="/exercises" element={<ExerciseLibrary />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
