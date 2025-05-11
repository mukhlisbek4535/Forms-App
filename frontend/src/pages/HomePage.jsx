import React, { useEffect, useState } from "react";
import axios from "axios";
// import TemplateCard from "../components/TemplateCard";
// import TagCloud from "../components/TagCloud";
import TagCloud from "../../components/TagCloud.jsx";
import TemplateCard from "../../components/TemplateCard.jsx";
import API from "../api/axios.js";
import { Link } from "react-router-dom";

const HomePage = () => {
  const [latestTemplates, setLatestTemplates] = useState([]);
  const [popularTemplates, setPopularTemplates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");

        const [latestRes, popularRes] = await Promise.all([
          API.get(
            "/templates/latest",
            // "https://forms-app-vff5.onrender.com/templates/latest",
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          ),
          API.get(
            "/templates/popular",
            // "https://forms-app-vff5.onrender.com/templates/popular",
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          ),
        ]);

        setLatestTemplates(latestRes.data.templates);
        setPopularTemplates(popularRes.data); // top 5 templates being fetched
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
      <div className="flex items-center justify-center gap-6 mt-6">
        <h1 className="text-3xl font-bold mx-9 text-blue-600">
          Welcome to Formify
        </h1>
        <a
          href="https://forms-app-vff5.onrender.com/salesforce/auth"
          className="bg-indigo-600 hover:bg-indigo-800 text-white px-4 py-2 rounded-xl shadow transition duration-200 text-sm"
        >
          Connect to Salesforce
        </a>
      </div>

      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold mb-2">Popular Tags</h2>
          <Link to="/templates" className="text-blue-500 hover:underline">
            Go to Templates
          </Link>
          <Link to="/users" className="text-blue-500 hover:underline">
            Go To Users Page
          </Link>
        </div>

        <TagCloud />
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">Latest Templates</h2>
        {loading ? (
          <p>Loading templates...</p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {latestTemplates.map((tpl) => (
              <TemplateCard key={tpl._id} template={tpl} />
            ))}
          </div>
        )}
      </section>

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
