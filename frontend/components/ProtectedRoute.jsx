import { useAuth } from "../src/context/AuthContext";
import { Navigate, useLocation } from "react-router-dom";

const ProtectedRoute = ({ children, roles = [] }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) return <Navigate to="/login" />;

  // if (roles.length > 0 && !roles.includes(user?.role))
  //   return <Navigate to="/unauthorized" replace />;

  return children;
};

export default ProtectedRoute;
