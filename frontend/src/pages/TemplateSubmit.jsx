import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";

const TemplateSubmit = () => {
  const { id } = useParams();
  const { token } = useAuth();

  const [template, setTemplate] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // 1️⃣ Fetch Template
  useEffect(() => {
    const fetchTemplate = async () => {
      try {
        const { data } = await axios.get(
          `http://localhost:5001/templates/${id}`,
          {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          }
        );

        setTemplate(data.template);

        // Initialize answers array with default empty values
        const initialAnswers = data.template.questions.map((q) => ({
          questionId: q._id,
          answerText: "",
          selectedOptions: [],
          type: q.questionType,
        }));

        setAnswers(initialAnswers);
      } catch (err) {
        toast.error("Failed to load template");
      } finally {
        setLoading(false);
      }
    };

    fetchTemplate();
  }, [id, token]);

  // 2️⃣ Handle Input Change
  const handleInputChange = (index, value, isCheckbox = false, option = "") => {
    const newAnswers = [...answers];

    if (isCheckbox) {
      const options = newAnswers[index].selectedOptions;
      if (value) {
        options.push(option);
      } else {
        newAnswers[index].selectedOptions = options.filter((o) => o !== option);
      }
    } else {
      newAnswers[index].answerText = value;
    }

    setAnswers(newAnswers);
  };

  // 3️⃣ Submit Response
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const { data } = await axios.post(
        "http://localhost:5001/response/submit",
        {
          templateId: template._id,
          templateVersion: template.version,
          answers,
        },
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );

      toast.success("Response submitted successfully!");
      navigate("/thank-you", { state: { username: data.name || "Guest" } });
    } catch (err) {
      const msg =
        err.response?.data?.message || "Submission failed. Try again.";
      console.log(err);
      toast.error(msg);
    }
  };

  if (loading) return <p className="p-4 text-center">Loading form...</p>;
  if (!template)
    return <p className="p-4 text-center text-red-500">Template not found</p>;

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-xl shadow">
      <h1 className="text-2xl font-bold text-blue-700 mb-4">
        📝 Fill Out: {template.title}
      </h1>
      <p className="text-gray-600 mb-6">{template.description}</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {template.questions.map((q, index) => (
          <div key={q._id} className="space-y-2">
            <label className="block font-medium">{q.questionText}</label>

            {q.questionType === "single-line" && (
              <input
                type="text"
                className="w-full border px-3 py-2 rounded"
                onChange={(e) => handleInputChange(index, e.target.value)}
              />
            )}

            {q.questionType === "multi-line" && (
              <textarea
                className="w-full border px-3 py-2 rounded"
                onChange={(e) => handleInputChange(index, e.target.value)}
              />
            )}

            {q.questionType === "number" && (
              <input
                type="number"
                className="w-full border px-3 py-2 rounded"
                onChange={(e) => handleInputChange(index, e.target.value)}
              />
            )}

            {q.questionType === "checkbox" && (
              <div className="space-y-1">
                {q.options.map((opt, i) => (
                  <label key={i} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      onChange={(e) =>
                        handleInputChange(index, e.target.checked, true, opt)
                      }
                    />
                    <span>{opt}</span>
                  </label>
                ))}
              </div>
            )}

            {q.questionType === "dropdown" && (
              <select
                className="w-full border px-3 py-2 rounded"
                onChange={(e) => handleInputChange(index, e.target.value)}
              >
                <option value="">Select...</option>
                {q.options.map((opt, i) => (
                  <option key={i} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            )}
          </div>
        ))}

        <button
          type="submit"
          className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 transition"
        >
          Submit Response
        </button>
      </form>
    </div>
  );
};

export default TemplateSubmit;
