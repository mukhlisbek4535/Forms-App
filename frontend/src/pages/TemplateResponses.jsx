import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import dayjs from "dayjs"; // for formatting date nicely

const TemplateResponses = () => {
  const { id } = useParams(); // /templates/:id/responses
  const { token } = useAuth();

  const [templateTitle, setTemplateTitle] = useState("");
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch responses
  useEffect(() => {
    const fetchResponses = async () => {
      try {
        const { data } = await axios.get(
          `https://forms-app-vff5.onrender.com/response/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setTemplateTitle(data.templateTitle);
        setResponses(data.responses || []);
      } catch (err) {
        console.log(err);
        setError(
          err.response?.data?.message ||
            "Failed to fetch responses. You may not have access."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchResponses();
  }, [id, token]);

  if (loading) return <p className="text-center mt-10">Loading responses...</p>;
  if (error) return <p className="text-center text-red-600 mt-10">{error}</p>;

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white rounded-xl shadow">
      <h1 className="text-2xl font-bold text-blue-700 mb-4">
        Responses for: {templateTitle}
      </h1>

      {responses.length === 0 ? (
        <p className="text-gray-500">No responses submitted yet.</p>
      ) : (
        <div className="space-y-6">
          {responses.map((res, idx) => (
            <div
              key={idx}
              className="border border-gray-200 rounded-lg p-4 bg-gray-50 shadow-sm"
            >
              <p className="text-sm text-gray-600 mb-2">
                Respondent:{" "}
                <span className="font-medium text-gray-800">
                  {res.respondent === "Anonymous"
                    ? "Anonymous"
                    : res.respondent}
                </span>{" "}
                | Submitted:{" "}
                {dayjs(res.submittedAt).format("MMM D, YYYY h:mm A")}
              </p>

              <div className="space-y-2 mt-2">
                {res.answers.map((ans, i) => (
                  <div key={i}>
                    <p className="font-semibold text-gray-700">
                      {ans.questionText}
                    </p>
                    <p className="text-sm text-gray-800 ml-2">
                      {ans.answerText || "—"}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8">
        <Link
          to={`/templates/${id}`}
          className="text-blue-600 hover:underline text-sm"
        >
          ← Back to Template View
        </Link>
      </div>
    </div>
  );
};

export default TemplateResponses;
