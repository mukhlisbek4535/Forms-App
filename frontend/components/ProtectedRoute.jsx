import { useAuth } from "../src/context/AuthContext";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, roles = [] }) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) return <Navigate to="/login" />;

  // if (roles.length > 0 && !roles.includes(user?.role))
  //   return <Navigate to="/unauthorized" replace />;

  return children;
};

export default ProtectedRoute;
