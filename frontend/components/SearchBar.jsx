// src/components/Navbar.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const SearchBar = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/searchFullText?q=${encodeURIComponent(searchTerm)}`);
      setSearchTerm(""); // clear input
    }
  };

  return (
    <nav className="bg-blue-600 text-white px-4 py-3 shadow">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <h1 className="text-xl font-bold">Formify</h1>
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search tags..."
            className="px-3 py-1 rounded text-black"
          />
          <button
            type="submit"
            className="bg-white text-blue-600 px-3 py-1 rounded"
          >
            Search
          </button>
        </form>
      </div>
    </nav>
  );
};

export default SearchBar;
