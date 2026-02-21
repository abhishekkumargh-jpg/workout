import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
    Activity, Flame, TrendingUp, Dumbbell, Plus, Trash2,
    Calendar, Clock, ChevronRight, Award
} from 'lucide-react';
import { getSummary, deleteWorkout } from '../api';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell
} from 'recharts';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#06b6d4', '#8b5cf6'];

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '10px 14px' }}>
                <p style={{ color: '#94a3b8', fontSize: 12, marginBottom: 4 }}>{label}</p>
                <p style={{ color: '#f1f5f9', fontWeight: 600 }}>{payload[0].value.toLocaleString()} kg</p>
            </div>
        );
    }
    return null;
};

export default function Dashboard() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState(null);

    const fetchStats = async () => {
        try {
            setLoading(true);
            const data = await getSummary();
            setStats(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchStats(); }, []);

    const handleDelete = async (e, id) => {
        e.stopPropagation();
        if (!confirm('Delete this workout?')) return;
        setDeletingId(id);
        try { await deleteWorkout(id); await fetchStats(); }
        catch (err) { console.error(err); }
        finally { setDeletingId(null); }
    };

    const formatDate = (dateStr) => {
        const d = new Date(dateStr + 'T00:00:00');
        return { day: d.getDate(), month: d.toLocaleString('default', { month: 'short' }).toUpperCase() };
    };

    if (loading) return (
        <div>
            <div className="page-header">
                <div className="page-title">Dashboard</div>
                <div className="page-subtitle">Your fitness overview</div>
            </div>
            <div className="loader"><div className="loader-dot" /><div className="loader-dot" /><div className="loader-dot" /></div>
        </div>
    );

    return (
        <div>
            {/* Header */}
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
                <div>
                    <div className="page-title">Dashboard 🏋️</div>
                    <div className="page-subtitle">Welcome back! Here's your progress overview.</div>
                </div>
                <Link to="/log" className="btn btn-primary btn-lg pulse">
                    <Plus size={18} /> Log Workout
                </Link>
            </div>

            {/* Stats */}
            <div className="stat-grid">
                <div className="stat-card">
                    <div className="stat-icon purple"><Activity size={20} /></div>
                    <div className="stat-label">Total Workouts</div>
                    <div className="stat-value">{stats?.totalWorkouts ?? 0}</div>
                    <div className="stat-sub">all time</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon green"><Flame size={20} /></div>
                    <div className="stat-label">Current Streak</div>
                    <div className="stat-value">{stats?.streak ?? 0}<span style={{ fontSize: 16, fontWeight: 500, color: 'var(--text-muted)' }}> days</span></div>
                    <div className="stat-sub">keep it up!</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon orange"><TrendingUp size={20} /></div>
                    <div className="stat-label">Total Volume</div>
                    <div className="stat-value">{stats?.totalVolume ? (stats.totalVolume / 1000).toFixed(1) + 'k' : '0'}<span style={{ fontSize: 14, color: 'var(--text-muted)', fontWeight: 500 }}> kg</span></div>
                    <div className="stat-sub">total weight lifted</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon pink"><Calendar size={20} /></div>
                    <div className="stat-label">This Week</div>
                    <div className="stat-value">{stats?.weekWorkouts ?? 0}<span style={{ fontSize: 16, fontWeight: 500, color: 'var(--text-muted)' }}> sessions</span></div>
                    <div className="stat-sub">last 7 days</div>
                </div>
            </div>

            {/* Charts + Recent */}
            <div className="two-col" style={{ marginBottom: 32 }}>
                {/* Volume by Muscle */}
                <div className="card card-glow">
                    <div className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Award size={18} color="var(--accent-light)" /> Volume by Muscle Group
                    </div>
                    {stats?.volumeByMuscle?.length > 0 ? (
                        <div className="chart-container" style={{ height: 280 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={stats.volumeByMuscle} margin={{ left: -20, bottom: 0 }}>
                                    <XAxis dataKey="muscle_group" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(99,102,241,0.05)' }} />
                                    <Bar dataKey="total_volume" radius={[6, 6, 0, 0]}>
                                        {stats.volumeByMuscle.map((_, i) => (
                                            <Cell key={i} fill={COLORS[i % COLORS.length]} fillOpacity={0.85} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="empty-state" style={{ padding: '32px 16px' }}>
                            <Dumbbell size={36} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
                            <p>Log workouts to see muscle volume breakdown</p>
                        </div>
                    )}
                </div>

                {/* Weekly Activity */}
                <div className="card card-glow">
                    <div className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Calendar size={18} color="var(--green)" /> Weekly Activity
                    </div>
                    {stats?.weeklyData?.length > 0 ? (
                        <div className="chart-container" style={{ height: 280 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={stats.weeklyData} margin={{ left: -20, bottom: 0 }}>
                                    <XAxis dataKey="week" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                                    <Tooltip
                                        contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }}
                                        labelStyle={{ color: '#94a3b8' }}
                                        itemStyle={{ color: '#f1f5f9' }}
                                    />
                                    <Bar dataKey="count" radius={[6, 6, 0, 0]} fill="#10b981" fillOpacity={0.8} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="empty-state" style={{ padding: '32px 16px' }}>
                            <Calendar size={36} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
                            <p>Log workouts to see weekly activity</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Recent Workouts */}
            <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <div className="section-title" style={{ marginBottom: 0 }}>Recent Workouts</div>
                    <Link to="/log" className="btn btn-ghost btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        View All <ChevronRight size={14} />
                    </Link>
                </div>
                {stats?.recentWorkouts?.length > 0 ? (
                    <div className="workout-list">
                        {stats.recentWorkouts.map((w, i) => {
                            const { day, month } = formatDate(w.date);
                            return (
                                <div key={w.id} className="workout-card" style={{ animationDelay: `${i * 0.05}s` }}>
                                    <div className="workout-card-left">
                                        <div className="workout-date-badge">
                                            <div className="day">{day}</div>
                                            <div className="month">{month}</div>
                                        </div>
                                        <div className="workout-info">
                                            <div className="title">{w.title}</div>
                                            <div className="meta">
                                                <span><Dumbbell size={12} />{w.exercise_count} exercises</span>
                                                {w.duration_minutes > 0 && <span><Clock size={12} />{w.duration_minutes} min</span>}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="workout-card-actions">
                                        <button
                                            className="btn btn-danger btn-icon btn-sm"
                                            onClick={(e) => handleDelete(e, w.id)}
                                            disabled={deletingId === w.id}
                                            title="Delete workout"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="card">
                        <div className="empty-state">
                            <Dumbbell size={48} />
                            <h3>No workouts yet</h3>
                            <p>Start logging your first workout to track your progress!</p>
                            <Link to="/log" className="btn btn-primary" style={{ marginTop: 24, display: 'inline-flex' }}>
                                <Plus size={16} /> Log Your First Workout
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
