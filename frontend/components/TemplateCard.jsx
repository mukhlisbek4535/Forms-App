// src/components/TemplateCard.jsx
import React from "react";
import { Link } from "react-router-dom";

const TemplateCard = ({ template }) => {
  if (!template) {
    console.log("template undefined");
    return null;
  }
  const { _id, title, description, image, createdBy } = template;

  return (
    <Link
      to={`/templates/${_id}`}
      className="block bg-white shadow hover:shadow-lg transition rounded-xl overflow-hidden"
    >
      {image ? (
        <img src={image} alt={title} className="h-40 w-full object-cover" />
      ) : (
        <div className="h-40 w-full bg-gray-200 flex items-center justify-center text-gray-500">
          No Image
        </div>
      )}

      <div className="p-4 space-y-1">
        <h3 className="text-lg font-bold text-blue-700 truncate">{title}</h3>
        <p className="text-gray-600 text-sm line-clamp-3">{description}</p>
        {createdBy?.name ? (
          <p className="text-xs text-gray-500 mt-2">By {createdBy.name}</p>
        ) : (
          <p>Guest</p>
        )}
      </div>
    </Link>
  );
};

export default TemplateCard;
