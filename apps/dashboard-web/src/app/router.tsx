import { createBrowserRouter, Navigate } from "react-router-dom";
import { AppLayout } from "@/layouts/AppLayout";
import { AuthGuard } from "@/guards/AuthGuard";
import { RoleGuard } from "@/guards/RoleGuard";
import { DashboardPage } from "@/pages/DashboardPage";
import { EventsPage, WorkflowsPage, SettingsPage } from "@/pages/StubPages";
import { LoginPage } from "@/pages/LoginPage";

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
      {
        path: "/settings",
        element: (
          <RoleGuard allow={["owner", "admin"]}>
            <SettingsPage />
          </RoleGuard>
        ),
      },
    ],
  },
]);
