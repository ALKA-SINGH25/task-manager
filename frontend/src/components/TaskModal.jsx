import { formatDate, getTodayDateInputValue, validateEndDate } from "../utils/taskHelpers";

const COLUMNS = [
  { id: "todo", label: "To Do", icon: "⬡" },
  { id: "in-progress", label: "In Progress", icon: "◈" },
  { id: "done", label: "Done", icon: "◉" },
];

const TaskModal = ({
  form,
  setForm,
  onSubmit,
  onClose,
  editTask,
  validationError,
  setValidationError,
}) => {
  const handleEndDateChange = (value) => {
    setForm({ ...form, end_date: value });
    const error = validateEndDate(value, !editTask);
    setValidationError(error);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>

        <div className="modal-header">
          <span>{editTask ? "Edit Task" : "New Task"}</span>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <label className="field-label" htmlFor="task-title">
          Title
        </label>
        <input
          id="task-title"
          className="input"
          placeholder="What needs to be done?"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          autoFocus
        />

        <label className="field-label" htmlFor="task-desc">
          Description
        </label>
        <textarea
          id="task-desc"
          className="input textarea"
          placeholder="Add description..."
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />

        <label className="field-label" htmlFor="end-date">
          Due Date
        </label>
        <input
          id="end-date"
          className="input"
          type="date"
          min={!editTask ? getTodayDateInputValue() : undefined}
          value={form.end_date}
          onChange={(e) => handleEndDateChange(e.target.value)}
        />

        {validationError && (
          <div className="modal-error">{validationError}</div>
        )}

        <label className="field-label">
          Status
        </label>
        <div className="status-pills">
          {COLUMNS.map((c) => (
            <button
              key={c.id}
              type="button"
              className={`pill ${form.status === c.id ? "pill-active" : ""}`}
              onClick={() => setForm({ ...form, status: c.id })}
            >
              <span style={{ 
                display: 'inline-block', 
                width: '6px', 
                height: '6px', 
                borderRadius: '50%', 
                background: c.id === 'todo' ? 'var(--text-muted)' : c.id === 'in-progress' ? 'var(--accent-cyan)' : 'var(--color-success)',
                marginRight: '6px'
              }} />
              {c.label}
            </button>
          ))}
        </div>

        {editTask && (
          <div className="task-details-panel">
            <div className="detail-row">
              <span>Created</span>
              <span>{editTask.created_at ? new Date(editTask.created_at).toLocaleString() : "—"}</span>
            </div>
            <div className="detail-row">
              <span>Updated</span>
              <span>{editTask.updated_at ? new Date(editTask.updated_at).toLocaleString() : "—"}</span>
            </div>
            <div className="detail-row">
              <span>Version</span>
              <span>v{editTask.version || 1}</span>
            </div>
            <div className="detail-row">
              <span>Deadline</span>
              <span>{formatDate(editTask.end_date)}</span>
            </div>
          </div>
        )}

        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn-submit"
            onClick={onSubmit}
            disabled={Boolean(validationError)}
          >
            {editTask ? "Save Changes" : "Create Task"}
          </button>
        </div>

      </div>
    </div>
  );
};

export default TaskModal;
