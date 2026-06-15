import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import API_URL from "../config/api";
import { useAuth } from "../context/AuthContext";
import { buildTaskPayload, buildUpdatePayload, parseApiError } from "../utils/taskHelpers";

const useTasks = (showToast) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  const getHeaders = useCallback(
    () => ({ Authorization: `Bearer ${token}` }),
    [token]
  );

  const fetchTasks = useCallback(async () => {
    if (!token) return;
    try {
      const res = await axios.get(`${API_URL}/tasks`, { headers: getHeaders() });
      setTasks(res.data);
    } catch (error) {
      showToast?.(parseApiError(error), "error");
    } finally {
      setLoading(false);
    }
  }, [token, getHeaders, showToast]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const createTask = async (taskData) => {
    try {
      const payload = buildTaskPayload(taskData);
      await axios.post(`${API_URL}/tasks`, payload, { headers: getHeaders() });
      await fetchTasks();
      showToast?.("Task created successfully", "success");
      return { success: true };
    } catch (error) {
      const message = parseApiError(error);
      showToast?.(message, "error");
      return { success: false, message };
    }
  };

  const updateTask = async (id, taskData) => {
    try {
      const payload = buildUpdatePayload(taskData);
      await axios.put(`${API_URL}/tasks/${id}`, payload, { headers: getHeaders() });
      await fetchTasks();
      showToast?.("Task updated successfully", "success");
      return { success: true };
    } catch (error) {
      const message = parseApiError(error);
      showToast?.(message, "error");
      return { success: false, message };
    }
  };

  const deleteTask = async (id) => {
    try {
      await axios.delete(`${API_URL}/tasks/${id}`, { headers: getHeaders() });
      await fetchTasks();
      showToast?.("Task deleted successfully", "success");
      return { success: true };
    } catch (error) {
      const message = parseApiError(error);
      showToast?.(message, "error");
      return { success: false, message };
    }
  };

  return { tasks, loading, createTask, updateTask, deleteTask, fetchTasks };
};

export default useTasks;
