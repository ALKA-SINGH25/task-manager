import { useMemo, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ToastProvider, useToast } from "./context/ToastContext";
import Header from "./components/Header";
import Board from "./components/Board";
import TaskModal from "./components/TaskModal";
import ReadTaskModal from "./components/ReadTaskModal";
import Toolbar from "./components/Toolbar";
import TaskList from "./components/TaskList";
import Login from "./pages/Login";
import Register from "./pages/Register";
import useTasks from "./hooks/useTasks";
import useAuthActions from "./hooks/useAuth";
import {
  filterTasksByStatus,
  sortTasks,
  toDateInputValue,
  validateEndDate,
} from "./utils/taskHelpers";
import "./App.css";

const EMPTY_FORM = { title: "", description: "", status: "todo", end_date: "" };

const ProtectedApp = () => {
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
  const { logout } = useAuth();
  const { currentUser } = useAuthActions();

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

  return (
    <div className="app">
      <div className="noise" />
      <Header
        tasks={visibleTasks}
        onNewTask={handleNewTask}
        onLogout={logout}
        currentUser={currentUser}
      />
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
    </div>
  );
};

const AppRoutes = () => {
  const { token } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={!token ? <Login /> : <Navigate to="/" />} />
      <Route path="/register" element={!token ? <Register /> : <Navigate to="/" />} />
      <Route path="/" element={token ? <ProtectedApp /> : <Navigate to="/login" />} />
    </Routes>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <AppRoutes />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
