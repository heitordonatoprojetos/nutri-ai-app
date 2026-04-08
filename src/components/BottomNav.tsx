import { Link, useLocation } from 'react-router-dom';
import { Home, Utensils, Camera, TrendingUp, User } from 'lucide-react';

export default function BottomNav() {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path ? 'active' : '';

  return (
    <nav className="bottom-nav">
      <Link to="/dashboard" className={`nav-item ${isActive('/dashboard')}`}>
        <Home size={24} />
        <span>Início</span>
      </Link>

      <Link to="/diet" className={`nav-item ${isActive('/diet')}`}>
        <Utensils size={24} />
        <span>Dieta</span>
      </Link>

      {/* FAB Camera */}
      <Link to="/camera" className="nav-item fab-wrapper" style={{ marginTop: '-40px' }}>
        <div style={{
          background: 'var(--accent-primary)',
          borderRadius: '50%',
          width: '60px', height: '60px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'white', boxShadow: 'var(--shadow-lg)',
        }}>
          <Camera size={28} />
        </div>
      </Link>

      <Link to="/progress" className={`nav-item ${isActive('/progress')}`}>
        <TrendingUp size={24} />
        <span>Progresso</span>
      </Link>

      <Link to="/profile" className={`nav-item ${isActive('/profile')}`}>
        <User size={24} />
        <span>Perfil</span>
      </Link>
    </nav>
  );
}
