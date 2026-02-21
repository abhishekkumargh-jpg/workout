const express = require('express');
const router = express.Router();
const db = require('../db');

// GET progress for a specific exercise (weight & volume over time)
router.get('/exercise/:exerciseId', (req, res) => {
    const data = db.prepare(`
    SELECT 
      w.date,
      we.sets,
      we.reps,
      we.weight,
      (we.sets * we.reps * we.weight) as volume,
      e.name as exercise_name
    FROM workout_exercises we
    JOIN workouts w ON we.workout_id = w.id
    JOIN exercises e ON we.exercise_id = e.id
    WHERE we.exercise_id = ?
    ORDER BY w.date ASC
  `).all(req.params.exerciseId);
    res.json(data);
});

// GET overall stats summary
router.get('/summary', (req, res) => {
    const totalWorkouts = db.prepare('SELECT COUNT(*) as count FROM workouts').get().count;
    const totalVolume = db.prepare(
        'SELECT COALESCE(SUM(sets * reps * weight), 0) as total FROM workout_exercises'
    ).get().total;
    const totalExercises = db.prepare('SELECT COUNT(*) as count FROM exercises').get().count;

    // This week's workouts
    const weekWorkouts = db.prepare(`
    SELECT COUNT(*) as count FROM workouts
    WHERE date >= date('now', '-7 days')
  `).get().count;

    // Streak calculation
    const dates = db.prepare(
        "SELECT DISTINCT date FROM workouts ORDER BY date DESC"
    ).all().map(r => r.date);

    let streak = 0;
    const today = new Date();
    for (let i = 0; i < dates.length; i++) {
        const diff = Math.floor((today - new Date(dates[i])) / (1000 * 60 * 60 * 24));
        if (diff === i || diff === i + 1) streak++;
        else break;
    }

    // Recent workouts
    const recentWorkouts = db.prepare(`
    SELECT w.*, COUNT(we.id) as exercise_count
    FROM workouts w
    LEFT JOIN workout_exercises we ON w.id = we.workout_id
    GROUP BY w.id
    ORDER BY w.date DESC
    LIMIT 5
  `).all();

    // Volume by muscle group
    const volumeByMuscle = db.prepare(`
    SELECT e.muscle_group, SUM(we.sets * we.reps * we.weight) as total_volume
    FROM workout_exercises we
    JOIN exercises e ON we.exercise_id = e.id
    GROUP BY e.muscle_group
    ORDER BY total_volume DESC
  `).all();

    // Workouts per week (last 8 weeks)
    const weeklyData = db.prepare(`
    SELECT strftime('%Y-W%W', date) as week, COUNT(*) as count
    FROM workouts
    WHERE date >= date('now', '-56 days')
    GROUP BY week
    ORDER BY week ASC
  `).all();

    res.json({
        totalWorkouts,
        totalVolume: Math.round(totalVolume),
        totalExercises,
        weekWorkouts,
        streak,
        recentWorkouts,
        volumeByMuscle,
        weeklyData
    });
});

module.exports = router;
