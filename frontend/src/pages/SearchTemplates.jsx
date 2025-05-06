import { useEffect, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import API from "../api/axios.js";

const SearchTemplates = () => {
  const { token } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const queryFromUrl = searchParams.get("q") || "";
  const [query, setQuery] = useState(queryFromUrl);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch results when URL query changes
  useEffect(() => {
    if (!queryFromUrl.trim()) return;

    const fetchResults = async () => {
      setLoading(true);
      setError("");
      try {
        const { data } = await API.get(
          `/templates/search?q=${queryFromUrl}`,
          // `https://forms-app-vff5.onrender.com/templates/search?q=${queryFromUrl}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setResults(data);
      } catch (err) {
        console.log(err);
        setError("Failed to search templates");
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [queryFromUrl, token]);

  // Handle search submit
  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/templates/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-blue-700 mb-4">
        🔍 Search Templates
      </h1>

      <form onSubmit={handleSearch} className="flex gap-2 mb-6">
        <input
          type="text"
          placeholder="Search by title, description, topic..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 border px-4 py-2 rounded-lg"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          Search
        </button>
      </form>

      {loading && <p className="text-gray-600">Searching...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {results.length > 0 ? (
        <div className="grid gap-4">
          {results.map((template) => (
            <div
              key={template._id}
              className="bg-white p-4 border rounded-lg shadow-sm"
            >
              <h2 className="text-lg font-semibold text-blue-800">
                {template.title}
              </h2>
              <p className="text-sm text-gray-600">
                {template.description || "No description"}
              </p>
              <div className="text-xs text-gray-400 mt-1">
                {template.isPublic ? "🌍 Public" : "🔒 Private"}
              </div>
              <Link
                to={`/templates/${template._id}`}
                className="text-blue-600 text-sm hover:underline mt-2 inline-block"
              >
                View Template →
              </Link>
            </div>
          ))}
        </div>
      ) : (
        !loading &&
        queryFromUrl.trim() && (
          <p className="text-gray-500">
            No templates found for "{queryFromUrl}"
          </p>
        )
      )}
    </div>
  );
};

export default SearchTemplates;
