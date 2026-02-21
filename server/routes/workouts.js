const express = require('express');
const router = express.Router();
const db = require('../db');

// GET all workouts (with exercise count)
router.get('/', (req, res) => {
    const workouts = db.prepare(`
    SELECT w.*, COUNT(we.id) as exercise_count
    FROM workouts w
    LEFT JOIN workout_exercises we ON w.id = we.workout_id
    GROUP BY w.id
    ORDER BY w.date DESC, w.created_at DESC
  `).all();
    res.json(workouts);
});

// GET single workout with exercises
router.get('/:id', (req, res) => {
    const workout = db.prepare('SELECT * FROM workouts WHERE id = ?').get(req.params.id);
    if (!workout) return res.status(404).json({ error: 'Workout not found' });

    const exercises = db.prepare(`
    SELECT we.*, e.name as exercise_name, e.category, e.muscle_group
    FROM workout_exercises we
    JOIN exercises e ON we.exercise_id = e.id
    WHERE we.workout_id = ?
  `).all(req.params.id);

    res.json({ ...workout, exercises });
});

// POST create workout
router.post('/', (req, res) => {
    const { date, title, notes, duration_minutes, exercises } = req.body;
    if (!date || !title) return res.status(400).json({ error: 'date and title are required' });

    const insertWorkout = db.prepare(
        'INSERT INTO workouts (date, title, notes, duration_minutes) VALUES (?, ?, ?, ?)'
    );
    const insertExercise = db.prepare(
        'INSERT INTO workout_exercises (workout_id, exercise_id, sets, reps, weight, notes) VALUES (?, ?, ?, ?, ?, ?)'
    );

    const run = db.transaction(() => {
        const result = insertWorkout.run(date, title, notes || '', duration_minutes || 0);
        const workoutId = result.lastInsertRowid;
        if (exercises && Array.isArray(exercises)) {
            for (const ex of exercises) {
                insertExercise.run(workoutId, ex.exercise_id, ex.sets, ex.reps, ex.weight, ex.notes || '');
            }
        }
        return workoutId;
    });

    const workoutId = run();
    const created = db.prepare('SELECT * FROM workouts WHERE id = ?').get(workoutId);
    res.status(201).json(created);
});

// DELETE workout
router.delete('/:id', (req, res) => {
    const workout = db.prepare('SELECT * FROM workouts WHERE id = ?').get(req.params.id);
    if (!workout) return res.status(404).json({ error: 'Workout not found' });
    db.prepare('DELETE FROM workouts WHERE id = ?').run(req.params.id);
    res.json({ message: 'Workout deleted' });
});

module.exports = router;
