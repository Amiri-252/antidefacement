// frontend/src/pages/PermissionsPage.js
import React, { useState, useEffect } from "react";
import { Shield, User, Edit2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const PermissionsPage = () => {
  const { hasRole } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      // For now, show mock data as the endpoint needs to be implemented
      setUsers([
        { id: 1, username: "admin", role: "admin", email: "admin@example.com", disabled: false },
        { id: 2, username: "operator1", role: "operator", email: "op1@example.com", disabled: false },
        { id: 3, username: "viewer1", role: "viewer", email: "viewer@example.com", disabled: false },
      ]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadgeColor = (role) => {
    const colors = {
      admin: "bg-red-100 text-red-800",
      operator: "bg-blue-100 text-blue-800",
      viewer: "bg-green-100 text-green-800",
    };
    return colors[role] || "bg-gray-100 text-gray-800";
  };

  const getRoleDescription = (role) => {
    const descriptions = {
      admin: "Full system access, user management, settings",
      operator: "Server management, backups, monitoring",
      viewer: "Read-only access to all data",
    };
    return descriptions[role] || "";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading permissions...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">User Permissions Management</h2>
          <p className="text-gray-600">Manage user roles and access privileges</p>
        </div>
        {hasRole("admin") && (
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
            <User className="w-4 h-4" />
            Add New User
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {["admin", "operator", "viewer"].map((role) => (
          <div key={role} className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-2">
              <Shield className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold capitalize">{role}</h3>
            </div>
            <p className="text-sm text-gray-600">{getRoleDescription(role)}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Users & Roles</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Username</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Role</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                  {hasRole("admin") && (
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-4 text-sm font-medium">{user.username}</td>
                    <td className="px-4 py-4 text-sm">{user.email}</td>
                    <td className="px-4 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getRoleBadgeColor(user.role)}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${user.disabled ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}`}>
                        {user.disabled ? "Disabled" : "Active"}
                      </span>
                    </td>
                    {hasRole("admin") && (
                      <td className="px-4 py-4">
                        <button className="text-blue-600 hover:text-blue-800 mr-2">
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PermissionsPage;
