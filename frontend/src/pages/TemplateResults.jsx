import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";

const COLORS = [
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#ff8042",
  "#00C49F",
  "#FFBB28",
];

const TemplateResults = () => {
  const { id } = useParams();
  const { token } = useAuth();

  const [results, setResults] = useState([]);
  const [title, setTitle] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const { data } = await axios.get(
          `https://forms-app-vff5.onrender.com/response/${id}/results`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setResults(data.results);
        setTitle(data.templateTitle);
      } catch (err) {
        setError("Failed to fetch aggregated results.");
        console.error(err);
      }
    };

    fetchResults();
  }, [id, token]);

  const renderChart = (question) => {
    const { questionType, summary } = question;

    if (questionType === "checkbox" || questionType === "dropdown") {
      const chartData = Object.entries(summary).map(([option, count]) => ({
        name: option,
        value: count,
      }));

      return (
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label
            >
              {chartData.map((_, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      );
    }

    if (questionType === "number") {
      return (
        <div className="text-gray-700">
          <p>
            Average: <strong>{summary.average}</strong>
          </p>
          <p>
            Min: <strong>{summary.min}</strong>
          </p>
          <p>
            Max: <strong>{summary.max}</strong>
          </p>
          <p>
            Total Responses: <strong>{summary.count}</strong>
          </p>
        </div>
      );
    }

    if (questionType === "single-line" || questionType === "multi-line") {
      return (
        <div className="text-gray-700">
          <p>
            Total Text Responses: <strong>{summary.responseCount}</strong>
          </p>
        </div>
      );
    }

    return <p className="text-sm text-red-500">Unsupported question type</p>;
  };

  if (error) return <p className="text-red-500 text-center mt-8">{error}</p>;

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-blue-700">
        Aggregated Results: {title}
      </h1>
      {results.map((q) => (
        <div
          key={q.questionId}
          className="mb-10 border p-6 rounded bg-white shadow"
        >
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            {q.questionText}
          </h2>
          {renderChart(q)}
        </div>
      ))}
    </div>
  );
};

export default TemplateResults;
