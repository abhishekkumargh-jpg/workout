const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'workout.db'));

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS exercises (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    category TEXT NOT NULL,
    muscle_group TEXT NOT NULL,
    description TEXT DEFAULT ''
  );

  CREATE TABLE IF NOT EXISTS workouts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,
    title TEXT NOT NULL,
    notes TEXT DEFAULT '',
    duration_minutes INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS workout_exercises (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    workout_id INTEGER NOT NULL,
    exercise_id INTEGER NOT NULL,
    sets INTEGER NOT NULL DEFAULT 1,
    reps INTEGER NOT NULL DEFAULT 1,
    weight REAL NOT NULL DEFAULT 0,
    notes TEXT DEFAULT '',
    FOREIGN KEY (workout_id) REFERENCES workouts(id) ON DELETE CASCADE,
    FOREIGN KEY (exercise_id) REFERENCES exercises(id)
  );
`);

// Seed exercises if table is empty
const count = db.prepare('SELECT COUNT(*) as c FROM exercises').get();
if (count.c === 0) {
  const insert = db.prepare(
    'INSERT OR IGNORE INTO exercises (name, category, muscle_group, description) VALUES (?, ?, ?, ?)'
  );

  const exercises = [
    // Chest
    ['Bench Press', 'Strength', 'Chest', 'Classic barbell bench press for chest development'],
    ['Incline Dumbbell Press', 'Strength', 'Chest', 'Upper chest focused dumbbell press'],
    ['Push-Up', 'Bodyweight', 'Chest', 'Classic bodyweight chest exercise'],
    ['Cable Flyes', 'Isolation', 'Chest', 'Cable crossover flyes for inner chest'],
    ['Dips', 'Bodyweight', 'Chest', 'Tricep and chest compound movement'],
    // Back
    ['Pull-Up', 'Bodyweight', 'Back', 'Classic lat-focused bodyweight pull'],
    ['Deadlift', 'Strength', 'Back', 'King of all compound movements'],
    ['Barbell Row', 'Strength', 'Back', 'Bent-over barbell row for upper back thickness'],
    ['Lat Pulldown', 'Strength', 'Back', 'Cable lat pulldown for lat width'],
    ['Seated Cable Row', 'Strength', 'Back', 'Seated cable row for mid-back'],
    // Legs
    ['Squat', 'Strength', 'Legs', 'King of lower body exercises'],
    ['Romanian Deadlift', 'Strength', 'Legs', 'Hip-hinge for hamstrings and glutes'],
    ['Leg Press', 'Strength', 'Legs', 'Quad-focused machine press'],
    ['Leg Curl', 'Isolation', 'Legs', 'Hamstring isolation curl machine'],
    ['Calf Raise', 'Isolation', 'Legs', 'Standing or seated calf raises'],
    ['Lunges', 'Bodyweight', 'Legs', 'Unilateral leg exercise'],
    // Shoulders
    ['Overhead Press', 'Strength', 'Shoulders', 'Barbell or dumbbell overhead press'],
    ['Lateral Raise', 'Isolation', 'Shoulders', 'Dumbbell lateral raise for side delts'],
    ['Face Pull', 'Isolation', 'Shoulders', 'Rear delt cable face pull'],
    ['Arnold Press', 'Isolation', 'Shoulders', 'Rotating dumbbell shoulder press'],
    // Arms
    ['Barbell Curl', 'Isolation', 'Biceps', 'Classic barbell bicep curl'],
    ['Hammer Curl', 'Isolation', 'Biceps', 'Neutral grip dumbbell curl'],
    ['Tricep Pushdown', 'Isolation', 'Triceps', 'Cable tricep pushdown'],
    ['Skull Crusher', 'Isolation', 'Triceps', 'Lying tricep extension'],
    // Core
    ['Plank', 'Bodyweight', 'Core', 'Isometric core hold'],
    ['Crunches', 'Bodyweight', 'Core', 'Classic abdominal crunch'],
    ['Russian Twist', 'Bodyweight', 'Core', 'Rotational core exercise'],
    ['Hanging Leg Raise', 'Bodyweight', 'Core', 'Hanging ab raise for lower abs'],
  ];

  const insertMany = db.transaction((exs) => {
    for (const ex of exs) insert.run(...ex);
  });
  insertMany(exercises);
  console.log('✅ Seeded exercises database');
}

module.exports = db;
