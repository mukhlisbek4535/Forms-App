import React from "react";
import ReactDOM from "react-dom/client";
import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import App from "./App.jsx";
import Login from "./pages/Login";
import Register from "./pages/Register";
import UserManagement from "./pages/UserManagement";
import NotFound from "./pages/NotFound.jsx";
import TemplateList from "./pages/TemplatesList.jsx";
import TemplateCreate from "./pages/TemplateCreate.jsx";
import TemplateEdit from "./pages/TemplateEdit.jsx";
import TemplateView from "./pages/TemplateView.jsx";

import "./index.css";
import LandingPage from "./pages/LandingPage.jsx";
import ProtectedRoute from "../components/ProtectedRoute.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import SearchTemplates from "./pages/SearchTemplates.jsx";
import TemplateSubmit from "./pages/TemplateSubmit.jsx";
import ThankYou from "./pages/ThankYou.jsx";
import TemplateResponses from "./pages/TemplateResponses.jsx";
import TemplateResults from "./pages/TemplateResults.jsx";
import TemplatesByTag from "./pages/TemplatesByTag.jsx";
import HomePage from "./pages/HomePage.jsx";
import SearchPage from "../components/FullTextSearchResults.jsx";

const Main = () => {
  // const { isLoggedIn } = React.useContext(AuthContext); // Moved context use inside component
  const { isAuthenticated } = useAuth();
  const router = createBrowserRouter([
    {
      path: "/",
      element: <App />,
      children: [
        {
          path: "/",
          element: isAuthenticated ? (
            <Navigate to="/dashboard" />
          ) : (
            <LandingPage />
          ),
        },
        { path: "/home", element: <HomePage /> },
        { path: "/search", element: <TemplatesByTag /> },
        {
          path: "/login",
          element: <Login />,
        },
        { path: "/searchFullText", element: <SearchPage /> },
        {
          path: "/register",
          element: <Register />,
        },
        {
          path: "/users",
          element: <UserManagement />,
        },
        {
          path: "/dashboard",
          element: (
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          ),
        },
        { path: "/thank-you", element: <ThankYou /> },
        {
          path: "/templates",
          element: <Navigate to="/templates/dashboard" />,
          children: [
            {
              path: "dashboard",
              element: (
                <ProtectedRoute>
                  <TemplateList />
                </ProtectedRoute>
              ),
            },
            { path: ":id/results", element: <TemplateResults /> },
            {
              path: ":id/responses",
              element: (
                <ProtectedRoute>
                  <TemplateResponses />
                </ProtectedRoute>
              ),
            },
            {
              path: "new",
              element: (
                <ProtectedRoute>
                  <TemplateCreate />
                </ProtectedRoute>
              ),
            },
            {
              path: ":id/fill",
              element: <TemplateSubmit />,
            },
            {
              path: ":id/edit",
              element: (
                <ProtectedRoute>
                  <TemplateEdit />
                </ProtectedRoute>
              ),
            },
            {
              path: "search",
              element: (
                <ProtectedRoute>
                  <SearchTemplates />
                </ProtectedRoute>
              ),
            },
            {
              path: ":id",
              element: (
                <ProtectedRoute>
                  <TemplateView />
                </ProtectedRoute>
              ),
            },
          ],
        },
        {
          path: "*",
          element: <NotFound />,
        },
      ],
    },
  ]);

  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
};

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Main />
  </React.StrictMode>
);
