import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    PlusSquare,
    TrendingUp,
    Dumbbell,
    Zap
} from 'lucide-react';

const links = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/log', icon: PlusSquare, label: 'Log Workout' },
    { to: '/progress', icon: TrendingUp, label: 'Progress' },
    { to: '/exercises', icon: Dumbbell, label: 'Exercises' },
];

export default function Navbar() {
    return (
        <>
            {/* Sidebar */}
            <nav className="navbar">
                <div className="nav-logo">
                    <div className="nav-logo-icon">
                        <Zap size={20} color="white" />
                    </div>
                    <div>
                        <div className="nav-logo-text">FitTrack</div>
                        <div className="nav-logo-sub" style={{ color: 'var(--text-muted)', fontSize: '11px', fontWeight: 400 }}>Workout Tracker</div>
                    </div>
                </div>

                <div className="nav-section-title">Menu</div>

                {links.map(({ to, icon: Icon, label }) => (
                    <NavLink
                        key={to}
                        to={to}
                        end={to === '/'}
                        className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
                    >
                        <Icon size={18} />
                        {label}
                    </NavLink>
                ))}
            </nav>

            {/* Mobile bottom nav */}
            <nav className="mobile-nav">
                {links.map(({ to, icon: Icon, label }) => (
                    <NavLink
                        key={to}
                        to={to}
                        end={to === '/'}
                        className={({ isActive }) => `mobile-nav-link${isActive ? ' active' : ''}`}
                    >
                        <Icon size={20} />
                        {label}
                    </NavLink>
                ))}
            </nav>
        </>
    );
}
