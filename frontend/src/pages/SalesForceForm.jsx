import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";

const SalesforceSuccess = () => {
  const location = useLocation();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    company: "",
    phone: "",
  });

  const [accessToken, setAccessToken] = useState("");
  const [instanceUrl, setInstanceUrl] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setAccessToken(params.get("access_token"));
    setInstanceUrl(params.get("instance_url"));
  }, [location]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        ...formData,
        accessToken,
        instanceUrl,
      };

      const res = await axios.post(
        "https://forms-app-vff5.onrender.com/salesforce/push",
        payload
      );
      setStatus("✅ Successfully pushed to Salesforce!");
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        company: "",
        phone: "",
      });
    } catch (err) {
      console.error(err);
      setStatus("❌ Failed to push data.");
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-10 p-6 bg-white rounded shadow">
      <h2 className="text-xl font-bold text-indigo-700 text-center mb-4">
        Post data to Salesforce CRM
      </h2>

      {status && <p className="text-center text-sm mb-4">{status}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="firstName"
          placeholder="First Name"
          required
          value={formData.firstName}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
        <input
          name="lastName"
          placeholder="Last Name"
          required
          value={formData.lastName}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
        <input
          name="email"
          placeholder="Email"
          type="email"
          required
          value={formData.email}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
        <input
          name="company"
          placeholder="Company"
          required
          value={formData.company}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
        <input
          name="phone"
          placeholder="Phone"
          required
          value={formData.phone}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />

        <button
          type="submit"
          className="bg-indigo-600 hover:bg-indigo-800 text-white px-4 py-2 rounded w-full"
        >
          Push to Salesforce
        </button>
      </form>
    </div>
  );
};

export default SalesforceSuccess;
