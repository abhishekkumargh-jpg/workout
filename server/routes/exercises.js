const express = require('express');
const router = express.Router();
const db = require('../db');

// GET all exercises (with optional category filter)
router.get('/', (req, res) => {
    const { category, muscle_group } = req.query;
    let query = 'SELECT * FROM exercises WHERE 1=1';
    const params = [];
    if (category) { query += ' AND category = ?'; params.push(category); }
    if (muscle_group) { query += ' AND muscle_group = ?'; params.push(muscle_group); }
    query += ' ORDER BY muscle_group, name';
    const exercises = db.prepare(query).all(...params);
    res.json(exercises);
});

// GET exercise categories
router.get('/categories', (req, res) => {
    const categories = db.prepare('SELECT DISTINCT category FROM exercises ORDER BY category').all();
    const muscleGroups = db.prepare('SELECT DISTINCT muscle_group FROM exercises ORDER BY muscle_group').all();
    res.json({
        categories: categories.map(r => r.category),
        muscle_groups: muscleGroups.map(r => r.muscle_group)
    });
});

// POST create custom exercise
router.post('/', (req, res) => {
    const { name, category, muscle_group, description } = req.body;
    if (!name || !category || !muscle_group)
        return res.status(400).json({ error: 'name, category, and muscle_group are required' });
    try {
        const result = db.prepare(
            'INSERT INTO exercises (name, category, muscle_group, description) VALUES (?, ?, ?, ?)'
        ).run(name, category, muscle_group, description || '');
        const exercise = db.prepare('SELECT * FROM exercises WHERE id = ?').get(result.lastInsertRowid);
        res.status(201).json(exercise);
    } catch (e) {
        if (e.message.includes('UNIQUE')) return res.status(409).json({ error: 'Exercise already exists' });
        res.status(500).json({ error: e.message });
    }
});

// DELETE custom exercise
router.delete('/:id', (req, res) => {
    const exercise = db.prepare('SELECT * FROM exercises WHERE id = ?').get(req.params.id);
    if (!exercise) return res.status(404).json({ error: 'Exercise not found' });
    db.prepare('DELETE FROM exercises WHERE id = ?').run(req.params.id);
    res.json({ message: 'Exercise deleted' });
});

module.exports = router;
