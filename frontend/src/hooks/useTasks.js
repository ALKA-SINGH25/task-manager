import { useState, useEffect, useCallback } from "react";
import axiosInstance from "../config/axiosInstance";
import { useAuth } from "../context/AuthContext";
import { buildTaskPayload, buildUpdatePayload, parseApiError } from "../utils/taskHelpers";

const useTasks = (showToast) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  const fetchTasks = useCallback(async () => {
    if (!token) return;
    try {
      const res = await axiosInstance.get(`/tasks`);
      setTasks(res.data);
    } catch (error) {
      showToast?.(parseApiError(error), "error");
    } finally {
      setLoading(false);
    }
  }, [token, showToast]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const createTask = async (taskData) => {
    try {
      const payload = buildTaskPayload(taskData);
      await axiosInstance.post(`/tasks`, payload);
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
      await axiosInstance.put(`/tasks/${id}`, payload);
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
      await axiosInstance.delete(`/tasks/${id}`);
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
