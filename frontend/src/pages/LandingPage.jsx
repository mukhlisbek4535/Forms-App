import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";

const LandingPage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center bg-gradient-to-br from-blue-100 to-white">
      <h1 className="text-4xl font-bold mb-4 text-blue-700">
        Welcome to Formify 🎉
      </h1>
      <p className="text-lg text-gray-700 mb-6">
        Create and share forms, polls, quizzes — and view responses in real
        time.
      </p>
      <div className="space-x-4">
        <Link
          to="/login"
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Login
        </Link>
        <Link
          to="/register"
          className="bg-gray-300 px-6 py-2 rounded-lg hover:bg-gray-400 transition"
        >
          Register
        </Link>
      </div>
    </div>
  );
};

export default LandingPage;
