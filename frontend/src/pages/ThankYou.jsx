import { useLocation, Link } from "react-router-dom";

const ThankYou = () => {
  const location = useLocation();
  const userName = location.state?.username || "Guest";

  return (
    <div className="max-w-xl mx-auto p-8 bg-white rounded-xl shadow mt-10 text-center">
      <h1 className="text-2xl font-bold text-green-700 mb-4">
        🎉 Response submitted successfully
      </h1>
      <p className="text-gray-700 text-lg mb-2">
        Thank you, <strong>{userName}</strong>, for submitting your response!
      </p>
      <p className="text-gray-500 mb-6">We appreciate your input and time.</p>

      <Link
        to="/templates/dashboard"
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Back to Templates
      </Link>
    </div>
  );
};

export default ThankYou;
