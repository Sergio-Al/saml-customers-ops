import { createBrowserRouter, Navigate } from "react-router-dom";
import { AppLayout } from "@/layouts/AppLayout";
import { AuthGuard } from "@/guards/AuthGuard";
import { DashboardPage } from "@/pages/DashboardPage";
import { EventsPage, WorkflowsPage, SettingsPage, LoginPage } from "@/pages/StubPages";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/dashboard" replace />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    element: (
      <AuthGuard>
        <AppLayout />
      </AuthGuard>
    ),
    children: [
      { path: "/dashboard", element: <DashboardPage /> },
      { path: "/events", element: <EventsPage /> },
      { path: "/workflows", element: <WorkflowsPage /> },
      { path: "/settings", element: <SettingsPage /> },
    ],
  },
]);
