import React from "react";
import { Link } from "react-router-dom";

const Dashboard = () => {
  return (
    <div>
      <div>Dashboard</div>
      <Link to="/templates/dashboard">Templates</Link>
    </div>
  );
};

export default Dashboard;
