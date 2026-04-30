import React, { useContext } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LayoutDashboard, FolderKanban, LogOut } from 'lucide-react';

const Layout = () => {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null; // Or a redirect to login

  return (
    <div className="app-container">
      <aside className="sidebar">
        <div className="sidebar-title">TeamSync</div>
        <nav className="sidebar-nav">
          <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>
            <LayoutDashboard size={20} /> Dashboard
          </Link>
          <Link to="/projects" className={`nav-link ${location.pathname.startsWith('/projects') ? 'active' : ''}`}>
            <FolderKanban size={20} /> Projects
          </Link>
        </nav>
        <div style={{ marginTop: 'auto' }}>
          <div style={{ marginBottom: '1rem', padding: '0 1rem', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '0.875rem' }}>Logged in as</div>
            <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{user.name}</div>
            <div style={{ fontSize: '0.75rem', marginTop: '0.25rem' }} className="badge badge-todo">{user.role}</div>
          </div>
          <button onClick={handleLogout} className="nav-link" style={{ width: '100%', background: 'transparent', color: 'var(--danger)', marginTop: '0.5rem' }}>
            <LogOut size={20} /> Logout
          </button>
        </div>
      </aside>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
