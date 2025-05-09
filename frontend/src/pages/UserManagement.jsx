import React, { useEffect, useState } from "react";
import { FaTrashAlt, FaUnlockAlt } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { StatusModal } from "./Modal";
import axios from "axios";
import API from "../api/axios.js";

const API_URL = "https://forms-app-vff5.onrender.com";

const UserManagement = () => {
  const [statusModalMessage, setStatusModalMessage] = useState("");
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const navigate = useNavigate();

  const getAuthHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  });

  const fetchUsers = async () => {
    try {
      const { data } = await API.get(
        "/users"
        // `${API_URL}/users`
      );
      setUsers(data);
    } catch (err) {
      console.error("Fetching users failed", err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSelectAll = (e) => {
    setSelectedUsers(e.target.checked ? users.map((u) => u._id) : []);
  };

  const handleSelectUser = (id) => {
    setSelectedUsers((prev) =>
      prev.includes(id) ? prev.filter((uid) => uid !== id) : [...prev, id]
    );
  };

  const isAllSelected =
    users.length > 0 && selectedUsers.length === users.length;

  const handleUserRoleChange = async (makeAdmin) => {
    try {
      const { data } = await API.put(
        "/roles",
        // `${API_URL}/roles`,
        { userIds: selectedUsers, makeAdmin },
        { headers: getAuthHeaders() }
      );
      setStatusModalMessage(data.message);
      await fetchUsers();
      setSelectedUsers([]);
    } catch (err) {
      console.error("Failed to change roles", err);
      setStatusModalMessage(err.message || "Failed to update user roles");
    }
  };

  const handleBlockUsers = async () => {
    try {
      const { data } = await API.put(
        "/block",
        // `${API_URL}/block`,
        { userIds: selectedUsers },
        { headers: getAuthHeaders() }
      );

      if (data.message === "You have blocked yourself") {
        setStatusModalMessage(data.message);
        navigate("/login");
      } else {
        setStatusModalMessage(data.message);
      }

      await fetchUsers();
      setSelectedUsers([]);
    } catch (err) {
      console.error("Failed to block users", err);
    }
  };

  const handleUnblockUsers = async () => {
    try {
      const { data } = await API.put(
        "/unblock",
        // `${API_URL}/unblock`,
        { userIds: selectedUsers },
        { headers: getAuthHeaders() }
      );

      setStatusModalMessage(data.message);
      await fetchUsers();
      setSelectedUsers([]);
    } catch (err) {
      console.error("Failed to unblock users", err);
    }
  };

  const handleDeleteUsers = async () => {
    try {
      const { data } = await API.delete(
        "/delete",
        // `${API_URL}/delete`,
        {
          headers: getAuthHeaders(),
          data: { userIds: selectedUsers },
        }
      );

      if (data.message === "You have deleted yourself") {
        setStatusModalMessage(data.message);
        navigate("/register");
      } else {
        setStatusModalMessage(data.message);
      }

      await fetchUsers();
      setSelectedUsers([]);
    } catch (err) {
      console.error("Failed to delete users", err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">User Management</h2>

          <div className="flex space-x-4">
            <button
              title="Logout"
              onClick={() => {
                localStorage.removeItem("token");
                navigate("/login");
              }}
              className="bg-gray-300 text-gray-800 px-3 py-1 rounded-md hover:bg-gray-400 transition-all duration-200 text-sm"
            >
              Logout
            </button>

            <button
              title="Block User(s)"
              onClick={handleBlockUsers}
              className="bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600 transition-all duration-200"
            >
              Block
            </button>

            <button
              title="Unblock User(s)"
              onClick={handleUnblockUsers}
              className="bg-blue-600 hover:bg-blue-800 rounded-xl px-3 text-white"
            >
              <FaUnlockAlt />
            </button>

            <button
              title="Delete User(s)"
              onClick={handleDeleteUsers}
              className="bg-red-500 hover:bg-red-800 text-white rounded-xl p-3"
            >
              <FaTrashAlt />
            </button>

            <button
              title="Promote to Admin"
              onClick={() => handleUserRoleChange(true)}
              className="bg-green-500 text-white px-3 py-1 rounded-md hover:bg-green-600"
            >
              Admin Promotion
            </button>

            <button
              title="Demote from Admin"
              onClick={() => handleUserRoleChange(false)}
              className="bg-gray-600 text-white px-3 py-1 rounded-md hover:bg-gray-700"
            >
              Admin Demotion
            </button>
          </div>
        </div>

        <table className="w-full table-auto border-collapse">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-3 text-left">
                <input
                  type="checkbox"
                  onChange={handleSelectAll}
                  checked={isAllSelected}
                />
              </th>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Email</th>
              <th className="p-3 text-left">Last Seen</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Role</th>
            </tr>
          </thead>
          <tbody>
            {[...users]
              .sort((a, b) => new Date(b.lastLogin) - new Date(a.lastLogin))
              .map((user) => (
                <tr key={user._id} className="border-b">
                  <td className="p-3">
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user._id)}
                      onChange={() => handleSelectUser(user._id)}
                    />
                  </td>
                  <td className="p-3">{user.name}</td>
                  <td className="p-3">{user.email}</td>
                  <td className="p-3">
                    {user.lastLogin
                      ? formatDistanceToNow(new Date(user.lastLogin), {
                          addSuffix: true,
                        })
                      : "Logged In Long Time Ago"}
                  </td>
                  <td
                    className={`p-3 font-semibold ${
                      user.status === "active"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                  </td>
                  <td className="p-3">{user.isAdmin ? "Admin" : "User"}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
      <Link
        to="/home"
        className="max-w-5xl mx-auto text-blue-500 underline ml-9"
      >
        Back to dashboard
      </Link>

      <StatusModal
        message={statusModalMessage}
        onClose={() => setStatusModalMessage("")}
      />
    </div>
  );
};

export default UserManagement;
