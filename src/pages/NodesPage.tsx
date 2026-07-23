import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { Server, Plus, Trash2, Wifi, WifiOff, HardDrive, MemoryStick, Cpu, Globe, X, AlertTriangle } from "lucide-react";

interface Node {
  id: string;
  name: string;
  host: string;
  port: number;
  ram: number;
  disk: number;
  cpu: number;
  status: string;
  createdAt: string;
}

export default function NodesPage() {
  const { user } = useAuth();
  const [nodes, setNodes] = useState<Node[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingNode, setEditingNode] = useState<Node | null>(null);
  const [name, setName] = useState("");
  const [host, setHost] = useState("");
  const [port, setPort] = useState("2376");
  const [ram, setRam] = useState("16");
  const [disk, setDisk] = useState("100");
  const [cpu, setCpu] = useState("100");
  const [loading, setLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const fetchNodes = async () => {
    try {
      const res = await axios.get("/api/nodes");
      setNodes(res.data);
    } catch (e) {}
  };

  useEffect(() => {
    fetchNodes();
  }, []);

  const openCreate = () => {
    setEditingNode(null);
    setName("");
    setHost("");
    setPort("2376");
    setRam("16");
    setDisk("100");
    setCpu("100");
    setShowForm(true);
  };

  const openEdit = (node: Node) => {
    setEditingNode(node);
    setName(node.name);
    setHost(node.host);
    setPort(String(node.port));
    setRam(String(node.ram));
    setDisk(String(node.disk));
    setCpu(String(node.cpu));
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { name, host, port: Number(port), ram: Number(ram), disk: Number(disk), cpu: Number(cpu) };
      if (editingNode) {
        await axios.put(`/api/nodes/${editingNode.id}`, payload);
      } else {
        await axios.post("/api/nodes", payload);
      }
      setShowForm(false);
      setEditingNode(null);
      await fetchNodes();
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to save node");
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`/api/nodes/${id}`);
      setDeleteConfirm(null);
      await fetchNodes();
    } catch (e) {}
  };

  const handleCheck = async (id: string) => {
    try {
      const res = await axios.post(`/api/nodes/${id}/check`);
      await fetchNodes();
    } catch (e) {}
  };

  if (user?.role !== "admin") {
    return (
      <div className="flex-1 p-6 md:p-8 flex items-center justify-center text-zinc-400">
        You do not have permission to view this page.
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex-1 p-6 md:p-8 max-w-5xl mx-auto w-full"
    >
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Nodes</h1>
          <p className="text-zinc-400">Manage remote servers that run your game server containers.</p>
        </div>
        <button
          onClick={openCreate}
          className="px-4 py-2.5 bg-white text-black font-semibold rounded-xl hover:bg-zinc-200 transition-colors shadow-lg shadow-white/10 text-sm whitespace-nowrap inline-flex items-center gap-2"
        >
          <Plus size={16} />
          Add Node
        </button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-8"
          >
            <form onSubmit={handleSubmit} className="bg-[#0a0a0c] p-6 md:p-8 rounded-2xl border border-white/5 shadow-2xl relative">
              <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
                <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 blur-[100px] rounded-full" />
              </div>

              <div className="flex items-center justify-between mb-6 relative z-10">
                <h2 className="text-xl font-bold text-white tracking-tight">
                  {editingNode ? "Edit Node" : "Add New Node"}
                </h2>
                <button type="button" onClick={() => setShowForm(false)} className="p-2 text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-zinc-300 mb-2 flex items-center">
                    <Server className="w-4 h-4 mr-2 text-cyan-400" /> Node Name
                  </label>
                  <input
                    type="text" required value={name} onChange={e => setName(e.target.value)}
                    className="w-full bg-white/[0.02] border border-white/10 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 rounded-xl px-4 py-3 text-white transition-all shadow-inner outline-none"
                    placeholder="e.g. US West Node"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2 flex items-center">
                    <Globe className="w-4 h-4 mr-2 text-orange-400" /> Host Address
                  </label>
                  <input
                    type="text" required value={host} onChange={e => setHost(e.target.value)}
                    className="w-full bg-white/[0.02] border border-white/10 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 rounded-xl px-4 py-3 text-white transition-all shadow-inner outline-none font-mono"
                    placeholder="192.168.1.100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2 flex items-center">
                    <Globe className="w-4 h-4 mr-2 text-orange-400" /> Docker Port
                  </label>
                  <input
                    type="number" required value={port} onChange={e => setPort(e.target.value)}
                    className="w-full bg-white/[0.02] border border-white/10 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 rounded-xl px-4 py-3 text-white transition-all shadow-inner outline-none font-mono"
                    placeholder="2376"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2 flex items-center">
                    <MemoryStick className="w-4 h-4 mr-2 text-purple-400" /> RAM (GB)
                  </label>
                  <input
                    type="number" required min={1} value={ram} onChange={e => setRam(e.target.value)}
                    className="w-full bg-white/[0.02] border border-white/10 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 rounded-xl px-4 py-3 text-white transition-all shadow-inner outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2 flex items-center">
                    <HardDrive className="w-4 h-4 mr-2 text-cyan-400" /> Disk (GB)
                  </label>
                  <input
                    type="number" required min={1} value={disk} onChange={e => setDisk(e.target.value)}
                    className="w-full bg-white/[0.02] border border-white/10 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 rounded-xl px-4 py-3 text-white transition-all shadow-inner outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2 flex items-center">
                    <Cpu className="w-4 h-4 mr-2 text-blue-400" /> CPU Limit (%)
                  </label>
                  <input
                    type="number" min={1} value={cpu} onChange={e => setCpu(e.target.value)}
                    className="w-full bg-white/[0.02] border border-white/10 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 rounded-xl px-4 py-3 text-white transition-all shadow-inner outline-none font-mono"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3 relative z-10">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-white font-medium rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 bg-white text-black font-semibold rounded-xl hover:bg-zinc-200 transition-colors disabled:opacity-50"
                >
                  {loading ? "Saving..." : editingNode ? "Update Node" : "Add Node"}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {nodes.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-black/40 backdrop-blur-xl rounded-3xl border border-white/10 p-16 text-center relative overflow-hidden ring-1 ring-white/5"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent pointer-events-none" />
          <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-white/10 shadow-inner relative z-10">
            <Server className="text-zinc-400" size={40} />
          </div>
          <h3 className="text-xl font-bold text-white mb-2 relative z-10 tracking-tight">No Nodes Added</h3>
          <p className="text-zinc-400 text-sm font-medium relative z-10">Add a node to start deploying servers across multiple machines.</p>
        </motion.div>
      ) : (
        <div className="grid gap-4">
          {nodes.map((node, index) => (
            <motion.div
              key={node.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10 relative overflow-hidden group hover:bg-black/60 transition-all ring-1 ring-white/5"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

              <div className="relative z-10 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-all shadow-inner ${node.status === "online" ? "bg-emerald-500/10 border-emerald-500/20" : "bg-zinc-800/50 border-zinc-700/30"}`}>
                      {node.status === "online" ? (
                        <Wifi className="w-6 h-6 text-emerald-400" />
                      ) : (
                        <WifiOff className="w-6 h-6 text-zinc-500" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white tracking-tight">{node.name}</h3>
                      <p className="text-sm font-mono text-zinc-400">{node.host}:{node.port}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full border ${node.status === "online" ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" : "text-zinc-500 bg-zinc-800/50 border-zinc-700/30"}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${node.status === "online" ? "bg-emerald-400 animate-pulse" : "bg-zinc-500"}`} />
                      {node.status || "unknown"}
                    </span>
                    <button
                      onClick={() => handleCheck(node.id)}
                      className="p-2 text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                      title="Check status"
                    >
                      <Wifi size={16} />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="bg-black/30 rounded-xl p-3 border border-white/5">
                    <div className="flex items-center gap-2 text-zinc-400 text-xs font-medium mb-1">
                      <MemoryStick size={14} className="text-purple-400" /> RAM
                    </div>
                    <p className="text-white font-bold text-lg">{node.ram} <span className="text-xs text-zinc-500 font-normal">GB</span></p>
                  </div>
                  <div className="bg-black/30 rounded-xl p-3 border border-white/5">
                    <div className="flex items-center gap-2 text-zinc-400 text-xs font-medium mb-1">
                      <HardDrive size={14} className="text-cyan-400" /> Disk
                    </div>
                    <p className="text-white font-bold text-lg">{node.disk} <span className="text-xs text-zinc-500 font-normal">GB</span></p>
                  </div>
                  <div className="bg-black/30 rounded-xl p-3 border border-white/5">
                    <div className="flex items-center gap-2 text-zinc-400 text-xs font-medium mb-1">
                      <Cpu size={14} className="text-blue-400" /> CPU
                    </div>
                    <p className="text-white font-bold text-lg">{node.cpu} <span className="text-xs text-zinc-500 font-normal">%</span></p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-white/5">
                  <p className="text-xs text-zinc-500">Added {new Date(node.createdAt).toLocaleDateString()}</p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEdit(node)}
                      className="text-xs font-medium text-zinc-400 hover:text-white px-3 py-1.5 hover:bg-white/5 rounded-lg transition-colors"
                    >
                      Edit
                    </button>
                    {deleteConfirm === node.id ? (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-red-400">Confirm?</span>
                        <button
                          onClick={() => handleDelete(node.id)}
                          className="text-xs font-medium text-red-400 hover:text-red-300 px-2 py-1.5 bg-red-500/10 rounded-lg transition-colors"
                        >
                          Delete
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(null)}
                          className="text-xs font-medium text-zinc-400 hover:text-white px-2 py-1.5 hover:bg-white/5 rounded-lg transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirm(node.id)}
                        className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
