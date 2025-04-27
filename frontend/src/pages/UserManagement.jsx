import React, { useEffect, useState } from "react";
import { FaTrashAlt, FaUnlockAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { StatusModal } from "./Modal";

const UserManagement = () => {
  const [statusModalMessage, setStatusModalMessage] = useState("");

  const navigate = useNavigate();
  // const { isLoggedIn } = useContext(AuthContext);
  // if (!isLoggedIn) return <Navigate to="/login" />;
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("http://localhost:5001/users");
        const data = await response.json();
        setUsers(data);
      } catch (err) {
        console.error("fetching users failed");
      }
    };

    fetchUsers();
  }, []);

  const [selectedUsers, setSelectedUsers] = useState([]);

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allUserIds = users.map((user) => user._id);
      setSelectedUsers(allUserIds);
    } else {
      setSelectedUsers([]);
    }
  };

  const handleSelectUser = (id) => {
    setSelectedUsers((prev) =>
      prev.includes(id) ? prev.filter((uid) => uid !== id) : [...prev, id]
    );
  };

  const isAllSelected =
    users.length > 0 && selectedUsers.length === users.length;

  function getAuthHeaders() {
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    };
  }

  async function handleBlockUsers() {
    try {
      const res = await fetch(
        "https://user-management-app-6ud8.onrender.com/block",
        {
          method: "PUT",
          headers: getAuthHeaders(),
          body: JSON.stringify({ userIds: selectedUsers }),
        }
      );

      const result = await res.json();

      if (result.message === "You have blocked yourself") {
        setStatusModalMessage(result.message);
        navigate("/login");
        return;
      } else {
        setStatusModalMessage(result.message);
      }
      console.log(result);

      const response = await fetch(
        "https://user-management-app-6ud8.onrender.com/users"
      );
      const updatedUsers = await response.json();
      setUsers(updatedUsers);
      setSelectedUsers([]);
    } catch (err) {
      console.error("Failed to block Users", err);
    }
  }

  async function handleUnblockUsers() {
    try {
      const res = await fetch(
        "https://user-management-app-6ud8.onrender.com/unblock",
        {
          method: "PUT",
          headers: getAuthHeaders(),
          body: JSON.stringify({ userIds: selectedUsers }),
        }
      );

      const result = await res.json();
      console.log(result);
      setStatusModalMessage(result.message);

      const updatedUsers = await fetch(
        "https://user-management-app-6ud8.onrender.com/users"
      );
      const data = await updatedUsers.json();
      setUsers(data);
      setSelectedUsers([]);
    } catch (err) {
      console.error("Failed to unblock users", err);
    }
  }

  async function handleDeleteUsers() {
    try {
      const res = await fetch(
        "https://user-management-app-6ud8.onrender.com/delete",
        {
          method: "DELETE",
          headers: getAuthHeaders(),
          body: JSON.stringify({ userIds: selectedUsers }),
        }
      );

      const result = await res.json();
      console.log(result);

      if (result.message === "You have deleted yourself") {
        setStatusModalMessage(result.message);
        navigate("/register");
        return;
      } else {
        setStatusModalMessage(result.message);
      }

      const updatedUsers = await fetch(
        "https://user-management-app-6ud8.onrender.com/users"
      );
      const data = await updatedUsers.json();
      setUsers(data);
      setSelectedUsers([]);
    } catch (err) {
      console.error("Failed to delete users", err);
    }
  }
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
                </tr>
              ))}
          </tbody>
        </table>
      </div>
      <StatusModal
        message={statusModalMessage}
        onClose={() => {
          setStatusModalMessage("");
        }}
      />
    </div>
  );
};

export default UserManagement;
