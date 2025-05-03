// src/pages/HomePage.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
// import TemplateCard from "../components/TemplateCard";
import TagCloud from "../components/TagCloud";

const HomePage = () => {
  const [latestTemplates, setLatestTemplates] = useState([]);
  const [popularTemplates, setPopularTemplates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");

        const [latestRes, popularRes] = await Promise.all([
          axios.get("https://forms-app-vff5.onrender.com/templates/my", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("https://forms-app-vff5.onrender.com/templates/popular", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setLatestTemplates(latestRes.data.templates.slice(0, 6));
        setPopularTemplates(popularRes.data); // already top 5
      } catch (err) {
        console.error("Failed to fetch homepage data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-10">
      <h1 className="text-3xl font-bold text-center text-blue-600">
        Welcome to Formify
      </h1>

      {/* ✅ Tag Cloud Section */}
      <section>
        <h2 className="text-xl font-semibold mb-2">Popular Tags</h2>
        <TagCloud />
      </section>

      {/* ✅ Latest Templates Gallery */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Latest Templates</h2>
        {loading ? (
          <p>Loading templates...</p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {latestTemplates.map((tpl) => (
              // <TemplateCard key={tpl._id} template={tpl} />
              <h1>TemplateCard {tpl}</h1>
            ))}
          </div>
        )}
      </section>

      {/* ✅ Top 5 Most Popular */}
      <section>
        <h2 className="text-xl font-semibold mt-10 mb-4">
          Top 5 Popular Templates
        </h2>
        <ul className="space-y-2">
          {popularTemplates.map((tpl, index) => (
            <li key={tpl._id} className="bg-gray-100 p-3 rounded shadow">
              <strong>#{index + 1}</strong> — {tpl.title}
              <span className="text-gray-500 block">{tpl.description}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
};

export default HomePage;
