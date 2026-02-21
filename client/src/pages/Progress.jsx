import { useEffect, useState } from 'react';
import { TrendingUp, BarChart2, Dumbbell, ChevronDown } from 'lucide-react';
import { getExercises, getExerciseProgress } from '../api';
import {
    LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Legend, ReferenceLine
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '12px 16px' }}>
                <p style={{ color: '#94a3b8', fontSize: 12, marginBottom: 8 }}>{label}</p>
                {payload.map((p, i) => (
                    <p key={i} style={{ color: p.color, fontWeight: 600, fontSize: 14 }}>
                        {p.name}: {p.value}{p.name === 'Weight' ? ' kg' : ' kg'}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

export default function Progress() {
    const [exercises, setExercises] = useState([]);
    const [selectedId, setSelectedId] = useState('');
    const [progressData, setProgressData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingEx, setLoadingEx] = useState(true);

    useEffect(() => {
        getExercises()
            .then(data => { setExercises(data); if (data.length > 0) setSelectedId(String(data[0].id)); })
            .catch(console.error)
            .finally(() => setLoadingEx(false));
    }, []);

    useEffect(() => {
        if (!selectedId) return;
        setLoading(true);
        getExerciseProgress(selectedId)
            .then(data => {
                // Aggregate by date (keep max weight per day)
                const byDate = {};
                data.forEach(d => {
                    if (!byDate[d.date] || d.weight > byDate[d.date].weight) {
                        byDate[d.date] = {
                            date: d.date,
                            Weight: d.weight,
                            Volume: Math.round(d.volume),
                            Sets: d.sets,
                            Reps: d.reps
                        };
                    }
                });
                setProgressData(Object.values(byDate).slice(-20));
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [selectedId]);

    const selectedExercise = exercises.find(e => String(e.id) === selectedId);
    const maxWeight = progressData.length > 0 ? Math.max(...progressData.map(d => d.Weight)) : 0;
    const totalVolume = progressData.reduce((sum, d) => sum + d.Volume, 0);
    const avgWeight = progressData.length > 0 ? (progressData.reduce((s, d) => s + d.Weight, 0) / progressData.length).toFixed(1) : 0;

    return (
        <div>
            <div className="page-header">
                <div className="page-title">Progress Charts 📈</div>
                <div className="page-subtitle">Track your strength gains over time</div>
            </div>

            {/* Exercise Selector */}
            <div className="card" style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)', fontSize: 14, fontWeight: 500 }}>
                        <Dumbbell size={16} /> Select Exercise:
                    </div>
                    <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
                        <select
                            className="form-select"
                            value={selectedId}
                            onChange={e => setSelectedId(e.target.value)}
                            disabled={loadingEx}
                            style={{ paddingRight: 36 }}
                        >
                            {exercises.map(e => (
                                <option key={e.id} value={e.id}>{e.name} ({e.muscle_group})</option>
                            ))}
                        </select>
                        <ChevronDown size={16} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                    </div>
                </div>
            </div>

            {/* Stats for Selected Exercise */}
            {progressData.length > 0 && (
                <div className="stat-grid" style={{ marginBottom: 24 }}>
                    <div className="stat-card">
                        <div className="stat-icon purple"><TrendingUp size={18} /></div>
                        <div className="stat-label">Max Weight</div>
                        <div className="stat-value">{maxWeight}<span style={{ fontSize: 14, color: 'var(--text-muted)', fontWeight: 500 }}> kg</span></div>
                        <div className="stat-sub">personal best</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon green"><BarChart2 size={18} /></div>
                        <div className="stat-label">Avg Weight</div>
                        <div className="stat-value">{avgWeight}<span style={{ fontSize: 14, color: 'var(--text-muted)', fontWeight: 500 }}> kg</span></div>
                        <div className="stat-sub">across sessions</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon orange"><Dumbbell size={18} /></div>
                        <div className="stat-label">Total Volume</div>
                        <div className="stat-value">{(totalVolume / 1000).toFixed(1)}<span style={{ fontSize: 14, color: 'var(--text-muted)', fontWeight: 500 }}>k kg</span></div>
                        <div className="stat-sub">total lifted</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon pink"><TrendingUp size={18} /></div>
                        <div className="stat-label">Sessions Logged</div>
                        <div className="stat-value">{progressData.length}</div>
                        <div className="stat-sub">for {selectedExercise?.name}</div>
                    </div>
                </div>
            )}

            {loading ? (
                <div className="loader"><div className="loader-dot" /><div className="loader-dot" /><div className="loader-dot" /></div>
            ) : progressData.length === 0 ? (
                <div className="card">
                    <div className="empty-state">
                        <TrendingUp size={48} />
                        <h3>No data yet</h3>
                        <p>Log workouts with this exercise to see your progress charts.</p>
                    </div>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                    {/* Weight Over Time */}
                    <div className="card card-glow">
                        <div className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <TrendingUp size={18} color="var(--accent-light)" />
                            Weight Progression — {selectedExercise?.name}
                        </div>
                        <div className="chart-container">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={progressData} margin={{ left: -10, right: 10, top: 10, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                    <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} unit=" kg" />
                                    <Tooltip content={<CustomTooltip />} />
                                    <ReferenceLine y={maxWeight} stroke="rgba(99,102,241,0.3)" strokeDasharray="4 4" />
                                    <Line
                                        type="monotone"
                                        dataKey="Weight"
                                        stroke="#6366f1"
                                        strokeWidth={3}
                                        dot={{ fill: '#6366f1', r: 5, strokeWidth: 2, stroke: '#0a0e1a' }}
                                        activeDot={{ r: 7, fill: '#818cf8' }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Volume Per Session */}
                    <div className="card card-glow">
                        <div className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <BarChart2 size={18} color="var(--green)" />
                            Volume Per Session (Sets × Reps × Weight)
                        </div>
                        <div className="chart-container">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={progressData} margin={{ left: -10, right: 10, top: 10, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                    <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} unit=" kg" />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Bar dataKey="Volume" fill="#10b981" fillOpacity={0.8} radius={[6, 6, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
