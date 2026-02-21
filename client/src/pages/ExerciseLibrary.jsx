import { useEffect, useState } from 'react';
import { Plus, X, Check, Search, Trash2, Dumbbell } from 'lucide-react';
import { getExercises, getCategories, createExercise, deleteExercise } from '../api';

const MUSCLE_COLORS = {
    Chest: 'var(--accent)', Back: 'var(--green)', Legs: 'var(--orange)',
    Shoulders: 'var(--cyan)', Biceps: 'var(--pink)', Triceps: 'var(--orange)',
    Core: 'var(--green)',
};

export default function ExerciseLibrary() {
    const [exercises, setExercises] = useState([]);
    const [categories, setCategories] = useState({ categories: [], muscle_groups: [] });
    const [filter, setFilter] = useState('All');
    const [search, setSearch] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ name: '', category: '', muscle_group: '', description: '' });
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [exData, catData] = await Promise.all([getExercises(), getCategories()]);
            setExercises(exData);
            setCategories(catData);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchData(); }, []);

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    const filtered = exercises.filter(e => {
        const matchFilter = filter === 'All' || e.muscle_group === filter;
        const matchSearch = e.name.toLowerCase().includes(search.toLowerCase()) ||
            e.muscle_group.toLowerCase().includes(search.toLowerCase()) ||
            e.category.toLowerCase().includes(search.toLowerCase());
        return matchFilter && matchSearch;
    });

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!form.name || !form.category || !form.muscle_group) {
            showToast('Name, category, and muscle group are required', 'error');
            return;
        }
        setSaving(true);
        try {
            await createExercise(form);
            showToast('Exercise added!');
            setForm({ name: '', category: '', muscle_group: '', description: '' });
            setShowForm(false);
            await fetchData();
        } catch (err) {
            showToast(err.response?.data?.error || 'Failed to create exercise', 'error');
        } finally { setSaving(false); }
    };

    const handleDelete = async (id, name) => {
        if (!confirm(`Delete "${name}"?`)) return;
        try {
            await deleteExercise(id);
            showToast('Exercise deleted');
            await fetchData();
        } catch (err) {
            showToast('Failed to delete', 'error');
        }
    };

    const muscleGroups = ['All', ...categories.muscle_groups];

    return (
        <div>
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
                <div>
                    <div className="page-title">Exercise Library 🏋️</div>
                    <div className="page-subtitle">{exercises.length} exercises • Browse, filter and add your own</div>
                </div>
                <button
                    className="btn btn-primary"
                    onClick={() => setShowForm(!showForm)}
                >
                    {showForm ? <X size={16} /> : <Plus size={16} />}
                    {showForm ? 'Cancel' : 'Add Exercise'}
                </button>
            </div>

            {/* Add Exercise Form */}
            {showForm && (
                <div className="card" style={{ marginBottom: 24, animation: 'slideUp 0.3s ease' }}>
                    <div className="section-title" style={{ marginBottom: 20 }}>Add Custom Exercise</div>
                    <form onSubmit={handleCreate}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 16 }}>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label">Exercise Name *</label>
                                <input className="form-input" type="text" placeholder="e.g. Cable Row"
                                    value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                            </div>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label">Category *</label>
                                <select className="form-select" value={form.category}
                                    onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                                    <option value="">Select...</option>
                                    {categories.categories.map(c => <option key={c} value={c}>{c}</option>)}
                                    <option value="Strength">Strength</option>
                                    <option value="Cardio">Cardio</option>
                                    <option value="Bodyweight">Bodyweight</option>
                                    <option value="Isolation">Isolation</option>
                                </select>
                            </div>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label">Muscle Group *</label>
                                <select className="form-select" value={form.muscle_group}
                                    onChange={e => setForm(f => ({ ...f, muscle_group: e.target.value }))}>
                                    <option value="">Select...</option>
                                    {categories.muscle_groups.map(m => <option key={m} value={m}>{m}</option>)}
                                </select>
                            </div>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label">Description</label>
                                <input className="form-input" type="text" placeholder="Brief description..."
                                    value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
                            </div>
                        </div>
                        <button type="submit" className="btn btn-primary" disabled={saving}>
                            {saving ? 'Saving...' : <><Check size={16} /> Add Exercise</>}
                        </button>
                    </form>
                </div>
            )}

            {/* Search + Filters */}
            <div style={{ marginBottom: 20 }}>
                <div className="search-box" style={{ marginBottom: 16 }}>
                    <Search size={16} />
                    <input
                        className="search-input"
                        type="text"
                        placeholder="Search exercises..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                    {search && (
                        <button onClick={() => setSearch('')} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                            <X size={14} />
                        </button>
                    )}
                </div>
                <div className="filter-pills">
                    {muscleGroups.map(mg => (
                        <button
                            key={mg}
                            className={`pill${filter === mg ? ' active' : ''}`}
                            onClick={() => setFilter(mg)}
                        >
                            {mg}
                        </button>
                    ))}
                </div>
            </div>

            {/* Count */}
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
                Showing <strong style={{ color: 'var(--text-secondary)' }}>{filtered.length}</strong> exercises
                {filter !== 'All' && ` in ${filter}`}
                {search && ` matching "${search}"`}
            </p>

            {/* Exercises Grid */}
            {loading ? (
                <div className="loader"><div className="loader-dot" /><div className="loader-dot" /><div className="loader-dot" /></div>
            ) : filtered.length === 0 ? (
                <div className="card">
                    <div className="empty-state">
                        <Dumbbell size={48} />
                        <h3>No exercises found</h3>
                        <p>Try adjusting your search or filter</p>
                    </div>
                </div>
            ) : (
                <div className="exercise-grid">
                    {filtered.map((ex, i) => (
                        <div
                            key={ex.id}
                            className={`exercise-card ${ex.muscle_group}`}
                            style={{ animationDelay: `${(i % 12) * 0.04}s` }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                                <div className="exercise-name" style={{ paddingLeft: 16 }}>{ex.name}</div>
                                <button
                                    className="btn btn-danger btn-icon btn-sm"
                                    onClick={() => handleDelete(ex.id, ex.name)}
                                    title="Delete exercise"
                                    style={{ flexShrink: 0 }}
                                >
                                    <Trash2 size={12} />
                                </button>
                            </div>
                            <div className="exercise-meta" style={{ display: 'flex', gap: 6, flexWrap: 'wrap', paddingLeft: 16 }}>
                                <span className="badge badge-muscle">{ex.muscle_group}</span>
                                <span className="badge badge-category">{ex.category}</span>
                            </div>
                            {ex.description && (
                                <p style={{ paddingLeft: 16, marginTop: 10, fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                                    {ex.description}
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            )}

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
