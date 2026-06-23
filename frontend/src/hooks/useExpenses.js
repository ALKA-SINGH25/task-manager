import { useState, useCallback } from "react";
import axiosInstance from "../config/axiosInstance";
import { useAuth } from "../context/AuthContext";
import { parseApiError } from "../utils/taskHelpers";

const useExpenses = (showToast) => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [analytics, setAnalytics] = useState(null);
  const { token } = useAuth();

  const fetchExpenses = useCallback(async (filters = {}) => {
    if (!token) return;
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.search) params.append("search", filters.search);
      if (filters.category && filters.category !== "all") params.append("category", filters.category);
      if (filters.month) params.append("month", filters.month);
      if (filters.year) params.append("year", filters.year);
      if (filters.sortField) params.append("sort_field", filters.sortField);
      if (filters.sortOrder) params.append("sort_order", filters.sortOrder);

      const res = await axiosInstance.get(`/expenses?${params.toString()}`);
      setExpenses(res.data);
    } catch (error) {
      showToast?.(parseApiError(error), "error");
    } finally {
      setLoading(false);
    }
  }, [token, showToast]);

  const fetchAnalytics = useCallback(async () => {
    if (!token) return;
    try {
      const res = await axiosInstance.get(`/expenses/analytics`);
      setAnalytics(res.data);
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
    }
  }, [token]);

  const createExpense = async (expenseData) => {
    try {
      await axiosInstance.post(`/expenses`, expenseData);
      showToast?.("Expense created successfully", "success");
      return { success: true };
    } catch (error) {
      const message = parseApiError(error);
      showToast?.(message, "error");
      return { success: false, message };
    }
  };

  const updateExpense = async (id, expenseData) => {
    try {
      await axiosInstance.put(`/expenses/${id}`, expenseData);
      showToast?.("Expense updated successfully", "success");
      return { success: true };
    } catch (error) {
      const message = parseApiError(error);
      showToast?.(message, "error");
      return { success: false, message };
    }
  };

  const deleteExpense = async (id) => {
    try {
      await axiosInstance.delete(`/expenses/${id}`);
      showToast?.("Expense deleted successfully", "success");
      return { success: true };
    } catch (error) {
      const message = parseApiError(error);
      showToast?.(message, "error");
      return { success: false, message };
    }
  };

  return {
    expenses,
    loading,
    analytics,
    fetchExpenses,
    fetchAnalytics,
    createExpense,
    updateExpense,
    deleteExpense
  };
};

export default useExpenses;
