// src/pages/SearchPage.jsx
import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import TemplateCard from "./TemplateCard.jsx";
const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const tag = searchParams.get("tag");
  const query = searchParams.get("q");

  useEffect(() => {
    const fetchResults = async () => {
      const token = localStorage.getItem("token");

      try {
        setLoading(true);

        let endpoint = "";
        if (tag) {
          endpoint = `/templates/searchByTag?tag=${tag}`;
        } else if (query) {
          endpoint = `/templates/searchByFullText?q=${encodeURIComponent(
            query
          )}`;
        }

        if (!endpoint) return;

        const res = await axios.get(
          `https://forms-app-vff5.onrender.com${endpoint}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setResults(res.data.templates || []);
      } catch (err) {
        setError("Search failed");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [tag, query]);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">
        {tag
          ? `Search results for tag: "${tag}"`
          : `Search results for query: "${query}"`}
      </h1>

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {!loading && results.length === 0 && (
        <p className="text-gray-500">No templates found.</p>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {results.map((template) => (
          <TemplateCard key={template._id} template={template} />
        ))}
      </div>
    </div>
  );
};

export default SearchPage;
