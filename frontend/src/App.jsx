import { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// Auth Pages
import Login from "./pages/auth/Login";
import ResetPassword from "./pages/auth/ResetPassword";
import ForgotPassword from "./pages/auth/ForgotPassword";

// Visiting Pages
import Maintance from "./pages/visiting/Maintance";
import Visiting from "./pages/visiting/Visiting";

// Issue Pages
import Ticket from "./pages/issue/Ticket";
import NewTicket from "./pages/issue/NewTicket";
import DetailTicket from "./pages/issue/DetailTicket";
import Report from "./pages/issue/Report";
import Panduan from "./pages/issue/Panduan";
import Setting from "./pages/issue/Setting";

// Layout & Components
import ProtectedRoute from "./components/ProtectedRoute";
import MainLayout from "./layouts/MainLayout";
import Dashboard from "./pages/Dashboard";
import RekrutMA from "./pages/visiting/RekrutMA";
import InputDatabase from "./pages/visiting/InputDatabase";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Ambil data login dari localStorage setelah komponen mount
  useEffect(() => {
    const loggedIn = localStorage.getItem("loggedIn") === "true";
    const storedUser = JSON.parse(localStorage.getItem("userData"));
    if (loggedIn && storedUser) {
      setIsLoggedIn(true);
      setUserData(storedUser);
    }
    setLoading(false);
  }, []);

  // Sinkronisasi localStorage jika login/logout
  useEffect(() => {
    if (isLoggedIn) {
      localStorage.setItem("loggedIn", "true");
      if (userData) localStorage.setItem("userData", JSON.stringify(userData));
    } else {
      localStorage.removeItem("loggedIn");
      localStorage.removeItem("userData");
    }
  }, [isLoggedIn, userData]);

  // Saat masih loading
  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );

  return (
    <Routes>
      {/* Redirect default ke login */}
      <Route path="/" element={<Navigate to="/login" />} />

      {/* Auth routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Main layout routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <MainLayout
              userData={userData}
              setIsLoggedIn={setIsLoggedIn}
              setUserData={setUserData}
            />
          </ProtectedRoute>
        }
      >
        {/* Dashboard */}
        <Route index element={<Dashboard user={userData} />} />

        {/* Issue Pages */}
        <Route path="ticket" element={<Ticket user={userData} />} />
        <Route path="ticket/new" element={<NewTicket user={userData} />} />
        <Route path="ticket/:id" element={<DetailTicket user={userData} />} />
        <Route path="report" element={<Report user={userData} />} />
        <Route path="panduan" element={<Panduan user={userData} />} />
        <Route
          path="setting"
          element={<Setting userData={userData} setIsLoggedIn={setIsLoggedIn} />}
        />

        {/* Visiting Pages */}
        <Route path="maintance" element={<Maintance user={userData} />} />
        <Route path="visiting" element={<Visiting user={userData} />} />
        <Route path="rekrutMA" element={<RekrutMA user={userData} />} />
        <Route path="leads" element={<InputDatabase user={userData} />} />
      </Route>

      {/* Fallback 404 */}
      <Route
        path="*"
        element={<div className="p-8 text-center">404 | Page Not Found</div>}
      />
    </Routes>
  );
}
