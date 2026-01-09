// src/routes/Routers.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "../features/auth/components/ProtectedRoute";
import Home from "../pages/Home";
import Login from "../features/auth/pages/Login";
import Register from "../features/auth/pages/Register";

// Admin routes
import AdminDashboard from "../features/admin/pages/AdminDashboard";
import Events from "../features/admin/pages/Events";
import DashboardLayout from "../features/admin/layout/DashboardLayout";

// Organizer routes
import OrganizerDashboard from "../features/organizer/pages/OrganizerDashboard";
import OrganizerEvents from "../features/organizer/pages/OrganizerEvents";
import CreateEvent from "../features/organizer/pages/CreateEvent";
import OrganizerDashboardLayout from "../features/organizer/layout/DashboardLayout";

// Volunteer routes
import VolunteerDashboard from "../features/volunteer/pages/VolunteerDashboard";
import VolunteerAvailableEvents from "../features/volunteer/pages/VolunteerAvailableEvents";
import VolunteerDashboardLayout from "../features/volunteer/layout/DashboardLayout";

export default function Routers() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Admin Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="events" element={<Events />} />
        <Route index element={<Navigate to="dashboard" replace />} />
      </Route>

      {/* Organizer Routes - COMPLETE */}
      <Route
        path="/organizer"
        element={
          <ProtectedRoute allowedRoles={["ORGANIZER"]}>
            <OrganizerDashboardLayout /> {/* ✅ Real Layout */}
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<OrganizerDashboard />} />
        <Route path="events" element={<OrganizerEvents />} />
        <Route path="create-event" element={<CreateEvent />} />
      </Route>

      {/* Volunteer Routes */}
      <Route
        path="/volunteer"
        element={
          <ProtectedRoute allowedRoles={["VOLUNTEER"]}>
            <VolunteerDashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<VolunteerDashboard />} />
        <Route path="events" element={<VolunteerAvailableEvents />} />
        <Route index element={<Navigate to="dashboard" replace />} />
      </Route>

      {/* Catch All */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
