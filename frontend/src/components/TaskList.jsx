import { formatDate, getStatusLabel, isOverdue } from "../utils/taskHelpers";

const TaskList = ({ tasks, onRead, onEdit, onDelete }) => {
  if (!tasks.length) {
    return (
      <div className="task-list-empty">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.45, marginBottom: '4px' }}>
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <line x1="9" y1="15" x2="15" y2="15"></line>
          <line x1="9" y1="19" x2="15" y2="19"></line>
          <line x1="9" y1="11" x2="10" y2="11"></line>
        </svg>
        <span>No tasks found matching the selected filters.</span>
      </div>
    );
  }

  return (
    <div className="task-list-wrap">
      <table className="task-list">
        <thead>
          <tr>
            <th>Title</th>
            <th>Status</th>
            <th>End Date</th>
            <th>Created</th>
            <th>Updated</th>
            <th>Version</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => {
            const overdue = isOverdue(task);
            return (
              <tr key={task._id} className={overdue ? "task-row-overdue" : ""}>
                <td>
                  <div className="task-list-title">{task.title}</div>
                  {task.description && (
                    <div className="task-list-desc">{task.description}</div>
                  )}
                </td>
                <td>
                  <span className={`badge badge-${task.status}`}>
                    {getStatusLabel(task.status)}
                  </span>
                </td>
                <td>
                  <div className="task-list-date">
                    {formatDate(task.end_date)}
                    {overdue && <span className="overdue-badge">OVERDUE</span>}
                  </div>
                </td>
                <td>{formatDate(task.created_at)}</td>
                <td>{formatDate(task.updated_at)}</td>
                <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}>v{task.version || 1}</td>
                <td>
                  <div className="task-list-actions">
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
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default TaskList;
