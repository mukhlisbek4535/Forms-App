// ✅ src/pages/SearchPage.jsx

import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import TemplateCard from "../../components/TemplateCard.jsx";

const TemplatesByTag = () => {
  const [searchParams] = useSearchParams();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const tag = searchParams.get("tag");

  useEffect(() => {
    const fetchTemplatesByTag = async () => {
      if (!tag) return;

      try {
        setLoading(true);
        const res = await axios.get(
          `https://forms-app-vff5.onrender.com/templates/searchByTag?tag=${tag}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setResults(res.data.templates || []);
      } catch (err) {
        setError("Failed to fetch templates");
        console.log(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTemplatesByTag();
  }, [tag]);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">
        Search results for tag: <span className="text-blue-600">"{tag}"</span>
      </h1>

      {loading && <p className="text-gray-500">Loading templates...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {!loading && results.length === 0 && (
        <p className="text-gray-500">No templates found for this tag.</p>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {results.map((template) => (
          <TemplateCard key={template._id} template={template} />
        ))}
      </div>
    </div>
  );
};

export default TemplatesByTag;
