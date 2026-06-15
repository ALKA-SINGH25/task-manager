const STATUS_LABELS = {
  todo: "Pending",
  "in-progress": "In Progress",
  done: "Completed",
};

const STATUS_FILTER_MAP = {
  all: null,
  pending: "todo",
  "in-progress": "in-progress",
  completed: "done",
};

export const getStatusLabel = (status) => STATUS_LABELS[status] || status;

export const filterTasksByStatus = (tasks, statusFilter) => {
  const mappedStatus = STATUS_FILTER_MAP[statusFilter];
  if (!mappedStatus) return tasks;
  return tasks.filter((task) => task.status === mappedStatus);
};

export const sortTasks = (tasks, sortField, sortOrder) => {
  const direction = sortOrder === "asc" ? 1 : -1;

  return [...tasks].sort((a, b) => {
    const aValue = a[sortField] ? new Date(a[sortField]).getTime() : null;
    const bValue = b[sortField] ? new Date(b[sortField]).getTime() : null;

    if (aValue === null && bValue === null) return 0;
    if (aValue === null) return 1;
    if (bValue === null) return -1;

    return (aValue - bValue) * direction;
  });
};

export const formatDate = (dateValue) => {
  if (!dateValue) return "No Deadline";
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "No Deadline";
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const isOverdue = (task) => {
  if (!task.end_date || task.status === "done") return false;
  const endDate = new Date(task.end_date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  endDate.setHours(0, 0, 0, 0);
  return endDate < today;
};

export const getTodayDateInputValue = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const toApiDate = (dateInputValue) => {
  if (!dateInputValue) return null;
  return new Date(`${dateInputValue}T00:00:00.000Z`).toISOString();
};

export const toDateInputValue = (dateValue) => {
  if (!dateValue) return "";
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const validateEndDate = (endDateValue, isNewTask) => {
  if (!endDateValue) return null;
  if (!isNewTask) return null;

  const selected = new Date(`${endDateValue}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (selected < today) {
    return "End date cannot be before the current date";
  }
  return null;
};

export const buildTaskPayload = (form) => ({
  title: form.title.trim(),
  description: form.description || null,
  status: form.status,
  end_date: toApiDate(form.end_date),
});

export const buildUpdatePayload = (task) => ({
  title: task.title,
  description: task.description || null,
  status: task.status,
  end_date: task.end_date || null,
});

export const parseApiError = (error) => {
  const detail = error?.response?.data?.detail;
  if (!detail) return "Something went wrong. Please try again.";
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    return detail.map((item) => item.msg || item.message || JSON.stringify(item)).join(", ");
  }
  return "Something went wrong. Please try again.";
};
