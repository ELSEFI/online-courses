import React, { useState, useEffect } from "react";
import { instructorsApi } from "../../api/instructors.api";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import LoadingSpinner from "../../components/ui/LoadingSpinner";

export default function InstructorsList() {
  const [items, setItems] = useState([]);
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
      const d = await instructorsApi.getAll();
      setItems(Array.isArray(d) ? d : []);
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
      const d = await instructorsApi.getById(id);
      setSelected(d);
    } catch (err) {
      console.error(err);
      setError("Failed");
    }
  };
  const remove = async (id) => {
    if (!window.confirm("Remove instructor?")) return;
    try {
      setProcessing(true);
      await instructorsApi.remove(id);
      await load();
      setSelected(null);
    } catch (err) {
      console.error(err);
      setError("Failed");
    } finally {
      setProcessing(false);
    }
  };

  const filtered = items.filter(
    (inst) =>
      (inst.userId?.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (inst.userId?.email || "").toLowerCase().includes(search.toLowerCase())
  );
  if (loading) return <LoadingSpinner />;
  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-6">Instructors</h1>
      {error && <div className="bg-red-800 p-3 mb-4">{error}</div>}
      <div className="mb-4">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search instructors..."
          className="w-full p-3 bg-gray-800 rounded"
        />
      </div>
      <div className="bg-gray-800 rounded p-4">
        {filtered.length === 0 ? (
          <div className="text-gray-400 p-8 text-center">No instructors</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="p-3">Name</th>
                <th className="p-3">Email</th>
                <th className="p-3">Job Title</th>
                <th className="p-3">Experience</th>
                <th className="p-3">Rating</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((i) => (
                <tr
                  key={i._id}
                  className="border-b border-gray-700/50 hover:bg-gray-700/20"
                >
                  <td className="p-3 text-white">{i.userId?.name || "N/A"}</td>
                  <td className="p-3 text-gray-300">
                    {i.userId?.email || "N/A"}
                  </td>
                  <td className="p-3 text-gray-300">
                    {i.jobTitle?.en || "N/A"}
                  </td>
                  <td className="p-3 text-gray-400">
                    {i.experienceYears} years
                  </td>
                  <td className="p-3 text-yellow-400">★ {i.rating || 0}</td>
                  <td className="p-3">
                    <Button onClick={() => view(i._id)}>View</Button>
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
        title="Instructor Details"
      >
        {selected && (
          <div>
            <p className="text-gray-400">Name</p>
            <p className="text-white">{selected.userId?.name}</p>
            <p className="text-gray-400 mt-3">Email</p>
            <p className="text-white">{selected.userId?.email}</p>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="bg-gray-700/30 p-4 rounded">
                Experience
                <p className="text-white font-bold">
                  {selected.experienceYears}y
                </p>
              </div>
              <div className="bg-gray-700/30 p-4 rounded">
                Rating
                <p className="text-yellow-400 font-bold">
                  ★ {selected.rating || 0}
                </p>
              </div>
            </div>
            <div className="mt-4">
              <Button
                onClick={() => remove(selected._id)}
                variant="danger"
                disabled={processing}
              >
                {processing ? "Processing..." : "Remove Instructor"}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
