import { useState, useEffect } from "react";
import axiosInstance from "../config/axiosInstance";
import { useAuth } from "../context/AuthContext";

const useAuthActions = () => {
  const { login, logout, token } = useAuth();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    if (token) fetchCurrentUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const fetchCurrentUser = async () => {
    try {
      const res = await axiosInstance.get(`/auth/me`);
      setCurrentUser(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const register = async (name, email, password) => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosInstance.post(`/auth/register`, {
        name,
        email,
        password,
      });
      login(res.data.access_token);
      return true;
    } catch (e) {
      if (!e.response) {
        setError("Cannot reach server. Make sure the backend is running on port 8000.");
      } else {
        const detail = e.response?.data?.detail;
        setError(
          typeof detail === "string"
            ? detail
            : Array.isArray(detail)
              ? detail.map((item) => item.msg).join(", ")
              : "Registration failed"
        );
      }
      return false;
    } finally {
      setLoading(false);
    }
  };

  const loginUser = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosInstance.post(`/auth/login`, {
        email,
        password,
      });
      login(res.data.access_token);
      return true;
    } catch (e) {
      if (!e.response) {
        setError("Cannot reach server. Make sure the backend is running on port 8000.");
      } else {
        const detail = e.response?.data?.detail;
        setError(
          typeof detail === "string"
            ? detail
            : Array.isArray(detail)
              ? detail.map((item) => item.msg).join(", ")
              : "Login failed"
        );
      }
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { register, loginUser, error, loading, currentUser };
};

export default useAuthActions;