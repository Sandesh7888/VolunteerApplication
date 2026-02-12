// src/routes/Routers.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "../features/auth/components/ProtectedRoute";
import Home from "../pages/Home";
import Login from "../features/auth/pages/Login";
import Register from "../features/auth/pages/Register";
import ForgotPassword from "../features/auth/pages/ForgotPassword";
import ResetPassword from "../features/auth/pages/ResetPassword";

// Admin routes
import AdminDashboard from "../features/admin/pages/AdminDashboard";
import Events from "../features/admin/pages/Events";
import AdminVolunteers from "../features/admin/pages/AdminVolunteers";
import AdminOrganizers from "../features/admin/pages/AdminOrganizers";
import AdminEventsApproval from "../features/admin/pages/AdminEventsApproval";
import AdminReports from "../features/admin/pages/AdminReports";

import AdminSettings from "../features/admin/pages/AdminSettings";
import AdminOrganizerDetails from "../features/admin/pages/AdminOrganizerDetails";
import AdminSupportTickets from "../features/admin/pages/AdminSupportTickets";
import AdminDocumentVerification from "../features/admin/pages/AdminDocumentVerification";
import DashboardLayout from "../features/admin/layout/DashboardLayout";

// Organizer routes
import OrganizerDashboard from "../features/organizer/pages/OrganizerDashboard";
import OrganizerEvents from "../features/organizer/pages/OrganizerEvents";
import CreateEvent from "../features/organizer/pages/CreateEvent";
import OrganizerVolunteers from "../features/organizer/pages/OrganizerVolunteers";
import OrganizerAttendance from "../features/organizer/pages/OrganizerAttendance";
import OrganizerReports from "../features/organizer/pages/OrganizerReports";
import OrganizerMessages from "../features/organizer/pages/OrganizerMessages";
import OrganizerProfile from "../features/organizer/pages/OrganizerProfile";
import OrganizerSettings from "../features/organizer/pages/OrganizerSettings";
import EditEvent from '../features/organizer/pages/EditEvent';
import OrganizerDashboardLayout from "../features/organizer/layout/DashboardLayout";
import OrganizerEventVolunteers from "../features/organizer/pages/OrganizerEventVolunteers";
import OrganizerEventDetails from "../features/organizer/pages/OrganizerEventDetails";
import OrganizerSupport from "../features/organizer/pages/OrganizerSupport";

// Volunteer routes
import VolunteerDashboard from "../features/volunteer/pages/VolunteerDashboard";
import VolunteerAvailableEvents from "../features/volunteer/pages/VolunteerAvailableEvents";
import VolunteerMyEvents from "../features/volunteer/pages/VolunteerMyEvents";
import VolunteerHistory from "../features/volunteer/pages/VolunteerHistory";
import VolunteerMessages from "../features/volunteer/pages/VolunteerMessages";
import VolunteerProfile from "../features/volunteer/pages/VolunteerProfile";
import VolunteerSettings from "../features/volunteer/pages/VolunteerSettings";
import VolunteerEventDetails from "../features/volunteer/pages/VolunteerEventDetails";
import VolunteerCertificates from "../features/volunteer/pages/VolunteerCertificates";
import VolunteerSupport from "../features/volunteer/pages/VolunteerSupport";
import VolunteerDashboardLayout from "../features/volunteer/layout/DashboardLayout";

export default function Routers() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* ✅ ADMIN ROUTES - COMPLETE */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <DashboardLayout />
          </ProtectedRoute>
        } 
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="volunteers" element={<AdminVolunteers />} />
        <Route path="volunteers/:id" element={<VolunteerProfile />} />
        <Route path="organizers" element={<AdminOrganizers />} />
        <Route path="organizers/:id" element={<AdminOrganizerDetails />} />
        <Route path="organizer-profile/:id" element={<OrganizerProfile />} />
        <Route path="events-approval" element={<AdminEventsApproval />} />
        <Route path="reports" element={<AdminReports />} />
        
        <Route path="settings" element={<AdminSettings />} />
        <Route path="events" element={<Events />} />
        <Route path="events/:eventId" element={<OrganizerEventDetails />} />
        <Route path="events/:id/edit" element={<EditEvent />} />
        <Route path="organizers/:id" element={<AdminOrganizerDetails />} />
        <Route path="support-tickets" element={<AdminSupportTickets />} />
        <Route path="document-verification" element={<AdminDocumentVerification />} />
      </Route>

      {/* ✅ ORGANIZER ROUTES - COMPLETE */}
      <Route
        path="/organizer"
        element={
          <ProtectedRoute allowedRoles={["ORGANIZER"]}>
            <OrganizerDashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<OrganizerDashboard />} />
        <Route path="create-event" element={<CreateEvent />} />
        <Route path="events" element={<OrganizerEvents />} />
        <Route path="volunteers" element={<OrganizerVolunteers />} />
        <Route path="attendance" element={<OrganizerAttendance />} />
        <Route path="reports" element={<OrganizerReports />} />
        <Route path="messages" element={<OrganizerMessages />} />
        <Route path="profile" element={<OrganizerProfile />} />
        <Route path="settings" element={<OrganizerSettings />} />
        <Route path="events/:id/edit" element={<EditEvent />} />
        <Route path="events/:eventId" element={<OrganizerEventDetails />} />
        <Route path="events/:eventId/volunteers" element={<OrganizerEventVolunteers />} />
        <Route path="support" element={<OrganizerSupport />} />
      </Route>

      {/* ✅ VOLUNTEER ROUTES - COMPLETE */}
      <Route
        path="/volunteer"
        element={
          <ProtectedRoute allowedRoles={["VOLUNTEER"]}>
            <VolunteerDashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<VolunteerDashboard />} />
        <Route path="browse-events" element={<VolunteerAvailableEvents />} />
        <Route path="my-events" element={<VolunteerMyEvents />} />
        <Route path="certificates" element={<VolunteerCertificates />} />
        <Route path="history" element={<VolunteerHistory />} />
        <Route path="messages" element={<VolunteerMessages />} />
        <Route path="profile" element={<VolunteerProfile />} />
        <Route path="settings" element={<VolunteerSettings />} />
        <Route path="events/:eventId" element={<VolunteerEventDetails />} />
        <Route path="support" element={<VolunteerSupport />} />
      </Route>

      {/* Catch All */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
