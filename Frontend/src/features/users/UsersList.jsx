import React, { useState, useEffect } from "react";
import { usersApi } from "../../api/users.api";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import LoadingSpinner from "../../components/ui/LoadingSpinner";

export default function UsersList() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);

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
      setError(err.message || "Failed");
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
    }
  };
  const toggle = async (id) => {
    if (!window.confirm("Change status?")) return;
    try {
      setProcessing(true);
      await usersApi.toggleStatus(id);
      await load();
      setSelected(null);
    } catch (err) {
      console.error(err);
      setError("Failed");
    } finally {
      setProcessing(false);
    }
  };
  const del = async (id) => {
    if (!window.confirm("Delete?")) return;
    try {
      setProcessing(true);
      await usersApi.delete(id);
      await load();
      setSelected(null);
    } catch (err) {
      console.error(err);
      setError("Failed");
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
    <div>
      <h1 className="text-3xl font-bold text-white mb-6">Users</h1>
      {error && <div className="bg-red-800 p-3 mb-4">{error}</div>}
      <div className="mb-4">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search..."
          className="w-full p-3 bg-gray-800 rounded"
        />
      </div>
      <div className="bg-gray-800 rounded p-4">
        {filtered.length === 0 ? (
          <div className="text-gray-400 p-8 text-center">No users</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="p-3 text-left">Name</th>
                <th className="p-3">Email</th>
                <th className="p-3">Status</th>
                <th className="p-3">Joined</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr
                  key={u._id}
                  className="border-b border-gray-700/50 hover:bg-gray-700/20"
                >
                  <td className="p-3 text-white">{u.name}</td>
                  <td className="p-3 text-gray-300">{u.email}</td>
                  <td className="p-3">
                    {u.status ? (
                      <span className="text-green-400">Active</span>
                    ) : (
                      <span className="text-red-400">Inactive</span>
                    )}
                  </td>
                  <td className="p-3 text-gray-400">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-3">
                    <Button onClick={() => view(u._id)}>View</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal
        isOpen={!!selected}
        onClose={() => setSelected(null)}
        title="User Details"
      >
        {selected && (
          <div>
            <p className="text-gray-400">Name</p>
            <p className="text-white">{selected.name}</p>
            <p className="text-gray-400 mt-3">Email</p>
            <p className="text-white">{selected.email}</p>
            <div className="flex gap-3 mt-4">
              <Button
                onClick={() => toggle(selected._id)}
                variant={selected.status ? "danger" : "success"}
                disabled={processing}
              >
                {processing
                  ? "Processing..."
                  : selected.status
                  ? "Deactivate"
                  : "Activate"}
              </Button>
              <Button
                onClick={() => del(selected._id)}
                variant="danger"
                disabled={processing}
              >
                {processing ? "Processing..." : "Delete"}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
