import { useState } from "react";

const Header = ({ tasks, onNewTask, onLogout, currentUser }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const totalDone = tasks.filter((t) => t.status === "done").length;
  const progress = tasks.length ? Math.round((totalDone / tasks.length) * 100) : 0;

  const initials = currentUser?.name
    ? currentUser.name.slice(0, 2).toUpperCase()
    : "??";

  return (
    <header className="header">
      <div className="header-left">
        <div className="logo-container">
          <div className="logo-icon">✓</div>
          <span className="logo-text">TaskFlow</span>
          <span className="logo-badge">Pro</span>
        </div>
      </div>

      <div className="header-center">
        <div className="progress-label">
          <span>Task Progress</span>
          <span>{progress}%</span>
        </div>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="header-right">
        <div className="stats">
          <span className="stat">
            {tasks.length} <small>total</small>
          </span>
          <div className="stat-divider" />
          <span className="stat accent">
            {totalDone} <small>completed</small>
          </span>
        </div>

        <button className="btn-add" onClick={onNewTask}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '2px' }}>
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          New Task
        </button>

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