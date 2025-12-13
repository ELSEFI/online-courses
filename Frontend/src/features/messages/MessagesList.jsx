import React, { useState, useEffect } from "react";
import { messagesApi } from "../../api/messages.api";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import LoadingSpinner from "../../components/ui/LoadingSpinner";

export default function MessagesList() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [reply, setReply] = useState("");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    load();
  }, []);
  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const d = await messagesApi.getAll();
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
      const d = await messagesApi.getById(id);
      setSelected(d);
    } catch (err) {
      console.error(err);
      setError("Failed");
    }
  };
  const sendReply = async () => {
    if (!reply.trim()) {
      alert("Enter reply");
      return;
    }
    try {
      setProcessing(true);
      await messagesApi.reply(selected._id, { reply });
      alert("Sent");
      setReply("");
      setSelected(null);
      await load();
    } catch (err) {
      console.error(err);
      setError("Failed to send");
    } finally {
      setProcessing(false);
    }
  };
  const del = async (id) => {
    if (!window.confirm("Delete message?")) return;
    try {
      setProcessing(true);
      await messagesApi.delete(id);
      await load();
      setSelected(null);
    } catch (err) {
      console.error(err);
      setError("Failed");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-6">Messages</h1>
      {error && <div className="bg-red-800 p-3 mb-4">{error}</div>}
      <div className="bg-gray-800 rounded p-4">
        {items.length === 0 ? (
          <div className="text-gray-400 p-8 text-center">No messages</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="p-3">Name</th>
                <th className="p-3">Email</th>
                <th className="p-3">Message</th>
                <th className="p-3">Date</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((m) => (
                <tr
                  key={m._id}
                  className="border-b border-gray-700/50 hover:bg-gray-700/20"
                >
                  <td className="p-3 text-white">{m.name}</td>
                  <td className="p-3 text-gray-300">{m.email}</td>
                  <td className="p-3 text-gray-400 truncate max-w-xs">
                    {m.message}
                  </td>
                  <td className="p-3 text-gray-400">
                    {new Date(m.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-3">
                    <Button onClick={() => view(m._id)}>View</Button>
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
        title="Message Details"
      >
        {selected && (
          <div>
            <p className="text-gray-400">From</p>
            <p className="text-white">{selected.name}</p>
            <p className="text-gray-400 mt-2">Email</p>
            <p className="text-white">{selected.email}</p>
            <p className="text-gray-400 mt-2">Message</p>
            <p className="text-white bg-gray-700 p-3 rounded mt-1">
              {selected.message}
            </p>
            <div className="mt-4">
              <textarea
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                rows="4"
                className="w-full bg-gray-700 text-white p-3 rounded"
                placeholder="Reply..."
              />
            </div>
            <div className="flex gap-3 mt-3">
              <Button
                onClick={sendReply}
                variant="success"
                disabled={processing}
              >
                {processing ? "Sending..." : "Send Reply"}
              </Button>
              <Button
                onClick={() => del(selected._id)}
                variant="danger"
                disabled={processing}
              >
                {processing ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
