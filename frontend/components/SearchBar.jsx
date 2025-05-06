import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const SearchBar = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/searchFullText?q=${encodeURIComponent(searchTerm)}`);
      setSearchTerm("");
    }
  };

  return (
    <nav className="bg-blue-600 px-4 py-3 shadow">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <Link to="/home" className="text-xl font-bold text-white">
          Formify
        </Link>
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by any keyword..."
            className="px-3 py-1 rounded text-stone-800"
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
