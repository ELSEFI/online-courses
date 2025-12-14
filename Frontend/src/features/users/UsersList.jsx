import React, { useState, useEffect } from "react";
import { usersApi } from "../../api/users.api";
import { Search, UserPlus } from "lucide-react";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import { useToast } from "../../components/ui/toast/ToastContext";
import { useConfirm } from "../../components/ui/confirm/ConfirmContext";

export default function UsersList() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUser, setNewUser] = useState({ name: "", email: "", password: "" });
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);

  const toast = useToast();
  const confirm = useConfirm();

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await usersApi.getAll();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to load users");
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const view = async (id) => {
    try {
      setError(null);
      const d = await usersApi.getById(id);
      setSelected(d);
    } catch (err) {
      console.error(err);
      setError("Failed to load user");
      toast.error("Failed to load user details");
    }
  };

  const addUser = async () => {
    if (!newUser.name || !newUser.email || !newUser.password) {
      toast.warning("All fields are required");
      return;
    }
    try {
      setProcessing(true);
      await usersApi.add(newUser);
      setShowAddModal(false);
      setNewUser({ name: "", email: "", password: "" });
      await load();
      toast.success("User added successfully!");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to add user");
      toast.error(err.response?.data?.message || "Failed to add user");
    } finally {
      setProcessing(false);
    }
  };

  const toggle = async (id) => {
    const confirmed = await confirm({
      title: "Change User Status",
      message: "Are you sure you want to change this user's status?",
      confirmText: "Yes, Change Status",
      variant: "warning",
    });

    if (!confirmed) return;

    try {
      setProcessing(true);
      await usersApi.toggleStatus(id);
      await load();
      setSelected(null);
      toast.success("User status updated successfully!");
    } catch (err) {
      console.error(err);
      setError("Failed to update status");
      toast.error("Failed to update user status");
    } finally {
      setProcessing(false);
    }
  };

  const del = async (id) => {
    const confirmed = await confirm({
      title: "Delete User",
      message:
        "Are you sure you want to delete this user permanently? This action cannot be undone!",
      confirmText: "Yes, Delete User",
      variant: "danger",
    });

    if (!confirmed) return;

    try {
      setProcessing(true);
      await usersApi.delete(id);
      await load();
      setSelected(null);
      toast.success("User deleted successfully!");
    } catch (err) {
      console.error(err);
      setError("Failed to delete user");
      toast.error("Failed to delete user");
    } finally {
      setProcessing(false);
    }
  };

  const filtered = users.filter(
    (u) =>
      (u.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (u.email || "").toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl lg:text-3xl font-bold text-white">
          Users Management
        </h1>
        <Button onClick={() => setShowAddModal(true)} variant="success">
          <UserPlus size={18} className="inline mr-2" />
          Add User
        </Button>
      </div>

      {error && (
        <div className="bg-red-800/20 border border-red-800 text-red-400 p-4 rounded-lg">
          {error}
        </div>
      )}

      {/* Search Bar */}
      <div className="relative">
        <Search
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          size={20}
        />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email..."
          className="w-full pl-10 pr-4 py-3 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 border border-gray-700"
        />
      </div>

      {/* Users Table */}
      <div className="bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p className="text-lg">No users found</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-700/50">
                <tr>
                  <th className="p-3 lg:p-4 text-left text-gray-300 font-semibold">
                    Name
                  </th>
                  <th className="p-3 lg:p-4 text-left text-gray-300 font-semibold hidden sm:table-cell">
                    Email
                  </th>
                  <th className="p-3 lg:p-4 text-left text-gray-300 font-semibold">
                    Status
                  </th>
                  <th className="p-3 lg:p-4 text-left text-gray-300 font-semibold hidden md:table-cell">
                    Joined
                  </th>
                  <th className="p-3 lg:p-4 text-center text-gray-300 font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {filtered.map((u) => (
                  <tr
                    key={u._id}
                    className="hover:bg-gray-700/30 transition-colors"
                  >
                    <td className="p-3 lg:p-4">
                      <div>
                        <p className="text-white font-medium">{u.name}</p>
                        <p className="text-gray-400 text-sm sm:hidden">
                          {u.email}
                        </p>
                      </div>
                    </td>
                    <td className="p-3 lg:p-4 text-gray-300 hidden sm:table-cell">
                      {u.email}
                    </td>
                    <td className="p-3 lg:p-4">
                      {u.status ? (
                        <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-green-600/20 text-green-400">
                          Active
                        </span>
                      ) : (
                        <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-red-600/20 text-red-400">
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="p-3 lg:p-4 text-gray-400 hidden md:table-cell">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-3 lg:p-4 text-center">
                      <Button onClick={() => view(u._id)} className="text-sm">
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* User Details Modal */}
      <Modal
        isOpen={!!selected}
        onClose={() => setSelected(null)}
        title="User Details"
      >
        {selected && (
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-400">Name</label>
              <p className="text-white font-medium">{selected.name}</p>
            </div>
            <div>
              <label className="text-sm text-gray-400">Email</label>
              <p className="text-white font-medium">{selected.email}</p>
            </div>
            <div>
              <label className="text-sm text-gray-400">Status</label>
              <p
                className={selected.status ? "text-green-400" : "text-red-400"}
              >
                {selected.status ? "Active" : "Inactive"}
              </p>
            </div>
            <div>
              <label className="text-sm text-gray-400">Joined</label>
              <p className="text-white">
                {new Date(selected.createdAt).toLocaleString()}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-700">
              <Button
                onClick={() => toggle(selected._id)}
                variant={selected.status ? "danger" : "success"}
                disabled={processing}
                className="flex-1"
              >
                {processing
                  ? "Processing..."
                  : selected.status
                  ? "Deactivate User"
                  : "Activate User"}
              </Button>
              <Button
                onClick={() => del(selected._id)}
                variant="danger"
                disabled={processing}
                className="flex-1"
              >
                {processing ? "Deleting..." : "Delete User"}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Add User Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setNewUser({ name: "", email: "", password: "" });
        }}
        title="Add New User"
      >
        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-400 block mb-2">Name</label>
            <input
              type="text"
              value={newUser.name}
              onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
              className="w-full bg-gray-700 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Enter user name"
            />
          </div>
          <div>
            <label className="text-sm text-gray-400 block mb-2">Email</label>
            <input
              type="email"
              value={newUser.email}
              onChange={(e) =>
                setNewUser({ ...newUser, email: e.target.value })
              }
              className="w-full bg-gray-700 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Enter email address"
            />
          </div>
          <div>
            <label className="text-sm text-gray-400 block mb-2">Password</label>
            <input
              type="password"
              value={newUser.password}
              onChange={(e) =>
                setNewUser({ ...newUser, password: e.target.value })
              }
              className="w-full bg-gray-700 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Enter password"
            />
          </div>
          <div className="flex gap-3 pt-4">
            <Button
              onClick={addUser}
              variant="success"
              disabled={processing}
              className="flex-1"
            >
              {processing ? "Adding..." : "Add User"}
            </Button>
            <Button
              onClick={() => {
                setShowAddModal(false);
                setNewUser({ name: "", email: "", password: "" });
              }}
              variant="secondary"
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
