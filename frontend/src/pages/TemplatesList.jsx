// src/pages/TemplatesList.jsx
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import axios from "axios";

const TemplatesList = () => {
  const { token, user, isAuthenticated } = useAuth();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const { data } = await axios.get(
          "https://forms-app-vff5.onrender.com/templates/my",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setTemplates(data.templates || []);
      } catch (err) {
        setError("Failed to load templates. " + err);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) fetchTemplates();
  }, [token, isAuthenticated]);

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this template?")) return;

    try {
      await axios.delete(
        `https://forms-app-vff5.onrender.com/templates/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setTemplates((prev) => prev.filter((t) => t._id !== id));
    } catch (err) {
      alert("Delete failed. You may not have permission.");
    }
  };

  if (loading) return <p className="text-center mt-10">Loading templates...</p>;
  if (error) return <p className="text-center mt-10 text-red-500">{error}</p>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-blue-700">My Templates</h1>
        <Link
          to="/templates/new"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Create New Template
        </Link>
      </div>

      {templates.length === 0 ? (
        <p className="text-gray-600">
          No templates found. Start by creating one!
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => (
            <div
              key={template._id}
              className="bg-white shadow-md rounded-xl p-4 border"
            >
              <h2 className="text-lg font-semibold text-blue-800">
                {template.title}
              </h2>
              <p className="text-sm text-gray-700">
                {template.description || "No description"}
              </p>
              <div className="text-xs text-gray-500 mt-2">
                {template.isPublic ? "🌍 Public" : "🔒 Private"}
              </div>
              <div className="flex gap-3 mt-4">
                <Link
                  to={`/templates/${template._id}`}
                  className="text-blue-600 hover:underline"
                >
                  View
                </Link>
                <Link
                  to={`/templates/${template._id}/results`}
                  className="text-blue-600 hover:underline mt-4 inline-block"
                >
                  📊 View Aggregated Results
                </Link>
                <Link
                  to={`/templates/${template._id}/fill`}
                  className="bg-blue-600 text-white rounded px-2 hover:bg-blue-700"
                >
                  Fill Out This Form →
                </Link>
                <Link
                  to={`/templates/${template._id}/responses`}
                  className="text-purple-600 hover:underline"
                >
                  View Responses
                </Link>
                {(String(user?._id) === String(template.createdBy?._id) ||
                  user?.isAdmin) && (
                  <>
                    <Link
                      to={`/templates/${template._id}/edit`}
                      className="text-green-600 hover:underline"
                    >
                      Edit
                    </Link>

                    <button
                      onClick={() => handleDelete(template._id)}
                      className="text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TemplatesList;
