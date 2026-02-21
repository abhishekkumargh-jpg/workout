import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Search, X, Check, ChevronDown, ChevronUp, Clock, FileText } from 'lucide-react';
import { getExercises, createWorkout } from '../api';

export default function LogWorkout() {
    const navigate = useNavigate();
    const today = new Date().toISOString().slice(0, 10);

    const [form, setForm] = useState({ date: today, title: '', notes: '', duration_minutes: '' });
    const [allExercises, setAllExercises] = useState([]);
    const [selectedExercises, setSelectedExercises] = useState([]);
    const [showPicker, setShowPicker] = useState(false);
    const [search, setSearch] = useState('');
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState(null);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        getExercises().then(setAllExercises).catch(console.error);
    }, []);

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    const filteredExercises = allExercises.filter(e =>
        e.name.toLowerCase().includes(search.toLowerCase()) ||
        e.muscle_group.toLowerCase().includes(search.toLowerCase())
    );

    const addExercise = (exercise) => {
        if (selectedExercises.find(e => e.exercise_id === exercise.id)) return;
        setSelectedExercises(prev => [...prev, {
            exercise_id: exercise.id,
            name: exercise.name,
            muscle_group: exercise.muscle_group,
            sets: '3',
            reps: '10',
            weight: '0',
            notes: '',
        }]);
        setShowPicker(false);
        setSearch('');
    };

    const removeExercise = (id) => setSelectedExercises(prev => prev.filter(e => e.exercise_id !== id));

    const updateExercise = (id, field, value) => {
        setSelectedExercises(prev => prev.map(e => e.exercise_id === id ? { ...e, [field]: value } : e));
    };

    const validate = () => {
        const errs = {};
        if (!form.title.trim()) errs.title = 'Workout title is required';
        if (!form.date) errs.date = 'Date is required';
        if (selectedExercises.length === 0) errs.exercises = 'Add at least one exercise';
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;
        setSaving(true);
        try {
            const payload = {
                date: form.date,
                title: form.title.trim(),
                notes: form.notes,
                duration_minutes: parseInt(form.duration_minutes) || 0,
                exercises: selectedExercises.map(ex => ({
                    exercise_id: ex.exercise_id,
                    sets: parseInt(ex.sets) || 1,
                    reps: parseInt(ex.reps) || 1,
                    weight: parseFloat(ex.weight) || 0,
                    notes: ex.notes,
                })),
            };
            await createWorkout(payload);
            showToast('Workout logged successfully! 💪');
            setTimeout(() => navigate('/'), 1500);
        } catch (err) {
            showToast('Failed to save workout', 'error');
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div>
            <div className="page-header">
                <div className="page-title">Log Workout 💪</div>
                <div className="page-subtitle">Record your training session with all details</div>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="two-col" style={{ marginBottom: 24 }}>
                    {/* Left — Details */}
                    <div className="card" style={{ height: 'fit-content' }}>
                        <div className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
                            <FileText size={18} color="var(--accent-light)" /> Workout Details
                        </div>

                        <div className="form-group">
                            <label className="form-label">Workout Title *</label>
                            <input
                                className="form-input"
                                type="text"
                                placeholder="e.g. Push Day, Leg Day, Full Body..."
                                value={form.title}
                                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                            />
                            {errors.title && <p style={{ color: 'var(--red)', fontSize: 12, marginTop: 4 }}>{errors.title}</p>}
                        </div>

                        <div className="form-group">
                            <label className="form-label">Date *</label>
                            <input
                                className="form-input"
                                type="date"
                                value={form.date}
                                onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <Clock size={13} /> Duration (minutes)
                            </label>
                            <input
                                className="form-input"
                                type="number"
                                placeholder="e.g. 60"
                                min="0"
                                value={form.duration_minutes}
                                onChange={e => setForm(f => ({ ...f, duration_minutes: e.target.value }))}
                            />
                        </div>

                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label">Notes</label>
                            <textarea
                                className="form-textarea"
                                placeholder="How did the session feel? Any PRs today?"
                                value={form.notes}
                                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                            />
                        </div>
                    </div>

                    {/* Right — Exercises */}
                    <div>
                        <div className="card">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                                <div className="section-title" style={{ marginBottom: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                                    Exercises {selectedExercises.length > 0 && (
                                        <span className="badge badge-success">{selectedExercises.length}</span>
                                    )}
                                </div>
                                <button
                                    type="button"
                                    className="btn btn-primary btn-sm"
                                    onClick={() => setShowPicker(!showPicker)}
                                >
                                    {showPicker ? <X size={14} /> : <Plus size={14} />}
                                    {showPicker ? 'Close' : 'Add Exercise'}
                                </button>
                            </div>

                            {errors.exercises && (
                                <p style={{ color: 'var(--red)', fontSize: 12, marginBottom: 12 }}>{errors.exercises}</p>
                            )}

                            {/* Exercise Picker */}
                            {showPicker && (
                                <div className="exercise-picker" style={{ marginBottom: 16 }}>
                                    <div className="search-box">
                                        <Search size={16} />
                                        <input
                                            className="search-input"
                                            type="text"
                                            placeholder="Search exercises by name or muscle..."
                                            value={search}
                                            onChange={e => setSearch(e.target.value)}
                                            autoFocus
                                        />
                                    </div>
                                    <div className="exercise-select-list">
                                        {filteredExercises.length === 0 ? (
                                            <p style={{ color: 'var(--text-muted)', fontSize: 13, padding: 12, textAlign: 'center' }}>No exercises found</p>
                                        ) : filteredExercises.map(ex => (
                                            <div
                                                key={ex.id}
                                                className="exercise-select-item"
                                                onClick={() => addExercise(ex)}
                                            >
                                                <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{ex.name}</span>
                                                <div style={{ display: 'flex', gap: 6 }}>
                                                    <span className="badge badge-muscle">{ex.muscle_group}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Selected Exercises */}
                            {selectedExercises.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)', fontSize: 14 }}>
                                    <Plus size={32} style={{ margin: '0 auto 8px', opacity: 0.3 }} />
                                    <p>Click "Add Exercise" to get started</p>
                                </div>
                            ) : (
                                <div className="selected-exercises">
                                    {selectedExercises.map((ex, i) => (
                                        <div key={ex.exercise_id} className="exercise-row" style={{ animationDelay: `${i * 0.05}s` }}>
                                            <div className="exercise-row-header">
                                                <div>
                                                    <div className="exercise-row-name">{ex.name}</div>
                                                    <span className="badge badge-muscle" style={{ marginTop: 4 }}>{ex.muscle_group}</span>
                                                </div>
                                                <button
                                                    type="button"
                                                    className="btn btn-danger btn-icon btn-sm"
                                                    onClick={() => removeExercise(ex.exercise_id)}
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                            <div className="form-row">
                                                <div className="form-group" style={{ marginBottom: 0 }}>
                                                    <label className="form-label">Sets</label>
                                                    <input className="form-input" type="number" min="1" value={ex.sets}
                                                        onChange={e => updateExercise(ex.exercise_id, 'sets', e.target.value)} />
                                                </div>
                                                <div className="form-group" style={{ marginBottom: 0 }}>
                                                    <label className="form-label">Reps</label>
                                                    <input className="form-input" type="number" min="1" value={ex.reps}
                                                        onChange={e => updateExercise(ex.exercise_id, 'reps', e.target.value)} />
                                                </div>
                                                <div className="form-group" style={{ marginBottom: 0 }}>
                                                    <label className="form-label">Weight (kg)</label>
                                                    <input className="form-input" type="number" min="0" step="0.5" value={ex.weight}
                                                        onChange={e => updateExercise(ex.exercise_id, 'weight', e.target.value)} />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            className="btn btn-primary btn-lg"
                            style={{ width: '100%', marginTop: 16 }}
                            disabled={saving}
                        >
                            {saving ? (
                                <><div className="loader-dot" /><div className="loader-dot" /><div className="loader-dot" /></>
                            ) : (
                                <><Check size={18} /> Save Workout</>
                            )}
                        </button>
                    </div>
                </div>
            </form>

            {/* Toast */}
            {toast && (
                <div className={`toast ${toast.type}`}>
                    {toast.type === 'success' ? <Check size={16} color="var(--green)" /> : <X size={16} color="var(--red)" />}
                    {toast.msg}
                </div>
            )}
        </div>
    );
}
