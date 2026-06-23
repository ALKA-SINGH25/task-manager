import { useState } from "react";
import { NavLink } from "react-router-dom";

const Header = ({ onLogout, currentUser }) => {
  const [showDropdown, setShowDropdown] = useState(false);

  const initials = currentUser?.name
    ? currentUser.name.slice(0, 2).toUpperCase()
    : "??";

  return (
    <header className="header" style={{ justifyContent: 'space-between' }}>
      <div className="header-left" style={{ display: 'flex', alignItems: 'center', gap: '40px' }}>
        <div className="logo-container">
          <div className="logo-icon">✓</div>
          <span className="logo-text">TaskFlow</span>
          <span className="logo-badge">Pro</span>
        </div>
        
        <nav className="header-nav" style={{ display: 'flex', gap: '20px' }}>
          <NavLink 
            to="/tasks" 
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            style={({ isActive }) => ({
              color: isActive ? '#fff' : '#888',
              textDecoration: 'none',
              fontWeight: isActive ? '600' : '500',
              padding: '8px 12px',
              borderRadius: '8px',
              background: isActive ? 'rgba(255,255,255,0.1)' : 'transparent',
              transition: 'all 0.2s',
              fontSize: '14px'
            })}
          >
            Tasks
          </NavLink>
          <NavLink 
            to="/expenses" 
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            style={({ isActive }) => ({
              color: isActive ? '#fff' : '#888',
              textDecoration: 'none',
              fontWeight: isActive ? '600' : '500',
              padding: '8px 12px',
              borderRadius: '8px',
              background: isActive ? 'rgba(255,255,255,0.1)' : 'transparent',
              transition: 'all 0.2s',
              fontSize: '14px'
            })}
          >
            Expenses
          </NavLink>
        </nav>
      </div>

      <div className="header-right">
        <div className="avatar-wrap">
          <button
            className="avatar"
            onClick={() => setShowDropdown(!showDropdown)}
          >
            {initials}
          </button>

          {showDropdown && (
            <div className="dropdown">
              <div className="dropdown-user">
                <div className="dropdown-name">{currentUser?.name}</div>
                <div className="dropdown-email">{currentUser?.email}</div>
              </div>
              <div className="dropdown-divider" />
              <button
                className="dropdown-item logout-item"
                onClick={() => { setShowDropdown(false); onLogout(); }}
              >
                Log Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;