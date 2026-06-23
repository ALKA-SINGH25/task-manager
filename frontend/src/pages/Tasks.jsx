import { useState, useMemo } from "react";
import { useToast } from "../context/ToastContext";
import useTasks from "../hooks/useTasks";
import Board from "../components/Board";
import TaskModal from "../components/TaskModal";
import ReadTaskModal from "../components/ReadTaskModal";
import Toolbar from "../components/Toolbar";
import TaskList from "../components/TaskList";
import {
  filterTasksByStatus,
  sortTasks,
  toDateInputValue,
  validateEndDate,
} from "../utils/taskHelpers";

const EMPTY_FORM = { title: "", description: "", status: "todo", end_date: "" };

const Tasks = () => {
  const { showToast } = useToast();
  const { tasks, loading, createTask, updateTask, deleteTask } = useTasks(showToast);
  const [showForm, setShowForm] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [readTask, setReadTask] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [validationError, setValidationError] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortField, setSortField] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("desc");
  const [viewMode, setViewMode] = useState("board");

  const visibleTasks = useMemo(() => {
    const filtered = filterTasksByStatus(tasks, statusFilter);
    return sortTasks(filtered, sortField, sortOrder);
  }, [tasks, statusFilter, sortField, sortOrder]);

  const handleNewTask = () => {
    setEditTask(null);
    setForm(EMPTY_FORM);
    setValidationError(null);
    setShowForm(true);
  };

  const handleRead = (task) => {
    setReadTask(task);
  };

  const handleCloseRead = () => {
    setReadTask(null);
  };

  const handleEdit = (task) => {
    setEditTask(task);
    setForm({
      title: task.title,
      description: task.description || "",
      status: task.status,
      end_date: toDateInputValue(task.end_date),
    });
    setValidationError(null);
    setShowForm(true);
  };

  const handleClose = () => {
    setShowForm(false);
    setEditTask(null);
    setForm(EMPTY_FORM);
    setValidationError(null);
  };

  const handleSubmit = async () => {
    if (!form.title.trim()) {
      setValidationError("Title is required");
      showToast("Title is required", "error");
      return;
    }

    const endDateError = validateEndDate(form.end_date, !editTask);
    if (endDateError) {
      setValidationError(endDateError);
      showToast(endDateError, "error");
      return;
    }

    const result = editTask
      ? await updateTask(editTask._id, form)
      : await createTask(form);

    if (result.success) {
      handleClose();
    }
  };

  const totalDone = tasks.filter((t) => t.status === "done").length;
  const progress = tasks.length ? Math.round((totalDone / tasks.length) * 100) : 0;

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div className="progress-label" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '12px', color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Task Progress</span>
                <span style={{ fontSize: '18px', fontWeight: 'bold' }}>{progress}%</span>
            </div>
            <div className="progress-track" style={{ width: '200px', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                <div className="progress-fill" style={{ width: `${progress}%`, height: '100%', background: 'var(--accent)', borderRadius: '3px', transition: 'width 0.3s ease' }} />
            </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div className="stats" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <span className="stat" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                    <span style={{ fontSize: '18px', fontWeight: 'bold' }}>{tasks.length}</span>
                    <small style={{ fontSize: '11px', color: '#888', textTransform: 'uppercase' }}>total</small>
                </span>
                <div className="stat-divider" style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.1)' }} />
                <span className="stat accent" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', color: 'var(--accent)' }}>
                    <span style={{ fontSize: '18px', fontWeight: 'bold' }}>{totalDone}</span>
                    <small style={{ fontSize: '11px', textTransform: 'uppercase' }}>completed</small>
                </span>
            </div>
            <button className="btn-add" onClick={handleNewTask}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                New Task
            </button>
        </div>
      </div>

      <Toolbar
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        sortField={sortField}
        onSortFieldChange={setSortField}
        sortOrder={sortOrder}
        onSortOrderChange={setSortOrder}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />
      {loading ? (
        viewMode === "board" ? (
          <div className="skeleton-board">
            {[1, 2, 3].map((colId) => (
              <div key={colId} className="skeleton-column">
                <div className="skeleton-col-header">
                  <div className="skeleton-bullet" />
                  <div className="skeleton-title" />
                </div>
                <div className="skeleton-card" />
                <div className="skeleton-card" />
              </div>
            ))}
          </div>
        ) : (
          <div className="skeleton-list-wrap">
            <div className="skeleton-table">
              <div className="skeleton-thead" />
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="skeleton-row" />
              ))}
            </div>
          </div>
        )
      ) : viewMode === "board" ? (
        <Board
          tasks={visibleTasks}
          onRead={handleRead}
          onEdit={handleEdit}
          onDelete={deleteTask}
          onUpdate={updateTask}
        />
      ) : (
        <TaskList
          tasks={visibleTasks}
          onRead={handleRead}
          onEdit={handleEdit}
          onDelete={deleteTask}
        />
      )}
      {showForm && (
        <TaskModal
          form={form}
          setForm={setForm}
          onSubmit={handleSubmit}
          onClose={handleClose}
          editTask={editTask}
          validationError={validationError}
          setValidationError={setValidationError}
        />
      )}
      {readTask && (
        <ReadTaskModal
          task={readTask}
          onClose={handleCloseRead}
        />
      )}
    </>
  );
};

export default Tasks;
