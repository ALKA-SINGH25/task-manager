import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import Header from "./components/Header";
import Tasks from "./pages/Tasks";
import Expenses from "./pages/Expenses";
import Login from "./pages/Login";
import Register from "./pages/Register";
import useAuthActions from "./hooks/useAuth";
import { ThemeProvider, createTheme } from '@mui/material/styles';
import "./App.css";

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

const ProtectedLayout = () => {
  const { logout } = useAuth();
  const { currentUser } = useAuthActions();

  return (
    <div className="app">
      <div className="noise" />
      <Header onLogout={logout} currentUser={currentUser} />
      <div className="page-content" style={{ padding: '30px', margin: '0 auto', maxWidth: '1400px', width: '100%', boxSizing: 'border-box' }}>
        <Outlet />
      </div>
    </div>
  );
};

const AppRoutes = () => {
  const { token } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={!token ? <Login /> : <Navigate to="/tasks" />} />
      <Route path="/register" element={!token ? <Register /> : <Navigate to="/tasks" />} />
      <Route path="/" element={token ? <ProtectedLayout /> : <Navigate to="/login" />}>
        <Route index element={<Navigate to="/tasks" replace />} />
        <Route path="tasks" element={<Tasks />} />
        <Route path="expenses" element={<Expenses />} />
      </Route>
    </Routes>
  );
};

function App() {
  return (
    <ThemeProvider theme={darkTheme}>
      <BrowserRouter>
        <AuthProvider>
          <ToastProvider>
            <AppRoutes />
          </ToastProvider>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
