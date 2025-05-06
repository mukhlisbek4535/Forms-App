import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import API from "../src/api/axios.js";

const getFontSize = (count, min = 12, max = 28) => {
  const capped = Math.min(count, 20);
  return `${min + ((max - min) * capped) / 20}px`;
};

const TagCloud = () => {
  const [tags, setTags] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const res = await API.get(
          // removed axios for API
          "/tags/popular"
          // "https://forms-app-vff5.onrender.com/tags/popular"
        );
        setTags(res.data.tags || []);
      } catch (err) {
        setError("Failed to load tag cloud..");
        console.error(err);
      }
    };

    fetchTags();
  }, []);

  if (error) return <p className="text-red-500">{error}</p>;

  if (tags.length === 0)
    return <p className="text-gray-500">No tags to show.</p>;

  return (
    <div className="mt-8 p-4 bg-white shadow rounded-xl">
      <h2 className="text-xl font-semibold mb-4 text-blue-700">
        Explore by Tags
      </h2>
      <div className="flex flex-wrap gap-2">
        {tags.map(({ tag, count }) => (
          <Link
            key={tag}
            to={`/search?tag=${encodeURIComponent(tag)}`}
            className="text-blue-600 hover:underline"
            style={{ fontSize: getFontSize(count) }}
          >
            #{tag}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default TagCloud;
