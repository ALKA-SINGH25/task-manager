import { useState, useEffect } from "react";
import axios from "axios";
import API_URL from "../config/api";
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
      const res = await axios.get(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCurrentUser(res.data);
    } catch (e) {
      console.error(e);
      if (e.response && e.response.status === 401) {
        logout();
      }
    }
  };

  const register = async (name, email, password) => {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.post(`${API_URL}/auth/register`, {
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
      const res = await axios.post(`${API_URL}/auth/login`, {
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