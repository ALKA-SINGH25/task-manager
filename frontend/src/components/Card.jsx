import { formatDate, isOverdue } from "../utils/taskHelpers";

const Card = ({ task, onRead, onEdit, onDelete, onDragStart, onDragEnd }) => {
  const overdue = isOverdue(task);

  return (
    <div
      className={`card ${overdue ? "card-overdue" : ""}`}
      draggable
      onDragStart={() => onDragStart(task)}
      onDragEnd={onDragEnd}
    >
      <div className="card-glow" />

      <div className="card-top">
        <p className="card-title">{task.title}</p>
        <div className="card-actions">
          <button className="icon-btn read-btn" onClick={() => onRead(task)} title="Read Task">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
          </button>
          <button className="icon-btn edit-btn" onClick={() => onEdit(task)} title="Edit Task">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
          </button>
          <button className="icon-btn del-btn" onClick={() => {
            if (window.confirm("Are you sure you want to delete this task?")) {
              onDelete(task._id);
            }
          }} title="Delete Task">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              <line x1="10" y1="11" x2="10" y2="17"></line>
              <line x1="14" y1="11" x2="14" y2="17"></line>
            </svg>
          </button>
        </div>
      </div>

      {task.description && (
        <p className="card-desc">{task.description}</p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginBottom: '0.85rem' }}>
        <div className="card-meta">
          <span className="card-date-label">Due:</span>
          <span className={`card-date-value ${!task.end_date ? "card-date-empty" : ""}`}>
            {formatDate(task.end_date)}
          </span>
          {overdue && <span className="overdue-badge">OVERDUE</span>}
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.68rem', color: 'var(--text-muted)', paddingLeft: '4px' }}>
          <span>Updated:</span>
          <span style={{ color: 'var(--text-secondary)' }}>{formatDate(task.updated_at || task.created_at)}</span>
        </div>
      </div>

      <div className="card-footer">
        <span className={`badge badge-${task.status}`}>{task.status}</span>
        <span className="drag-hint">drag to move</span>
      </div>
    </div>
  );
};

export default Card;
