import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";
import { Shield, User, Trash2, Bot, Wrench, Zap, RefreshCw } from "lucide-react";

export default function SettingsPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<any>(null);
  const [customPrompt, setCustomPrompt] = useState("");
  const [hasApiKey, setHasApiKey] = useState(false);
  const [newApiKey, setNewApiKey] = useState("");
  const [isKeySaving, setIsKeySaving] = useState(false);

  const fetchUsers = async () => {
    if (user.role !== "admin") return;
    try {
      const res = await axios.get("/api/system/users");
      setUsers(res.data);
    } catch (e) {}
  };

  useEffect(() => {
    fetchUsers();
    if (user.role === 'admin') {
      fetchApiKeyStatus();
    }
  }, [user]);

  const fetchApiKeyStatus = async () => {
    try {
      const res = await axios.get("/api/ai/key");
      setHasApiKey(res.data.hasKey);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveApiKey = async () => {
    if (!newApiKey.trim()) return;
    setIsKeySaving(true);
    try {
      await axios.post("/api/ai/key", { apiKey: newApiKey });
      setHasApiKey(true);
      setNewApiKey("");
      alert("API Key saved and verified successfully!");
    } catch (e: any) {
      alert(e.response?.data?.error || "Failed to save API key. Make sure it is valid.");
    } finally {
      setIsKeySaving(false);
    }
  };

  const handleDeleteApiKey = async () => {
    try {
      await axios.delete("/api/ai/key");
      setHasApiKey(false);
    } catch (e: any) {
      alert("Failed to delete API key");
    }
  };

  const createUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post("/api/system/users", { username, password, role });
      setUsername("");
      setPassword("");
      fetchUsers();
      alert("User created successfully");
    } catch (e: any) {
      alert(e.response?.data?.error || "Error creating user");
    }
  };

  const deleteUser = async (id: string) => {
    try {
      await axios.delete(`/api/system/users/${id}`);
      fetchUsers();
    } catch (e) {}
  };

  const handleAiAction = async (action: 'fix_bug' | 'improve') => {
    setIsAiLoading(true);
    setAiResult(null);
    try {
      const res = await axios.post("/api/ai/execute", { 
        action, 
        prompt: customPrompt || (action === 'fix_bug' ? "Diagnose and fix any bugs." : "Improve the panel GUI and processes.") 
      });
      setAiResult(res.data);
      if (res.data?.themeChanges?.bg) {
         document.body.className = `${res.data.themeChanges.bg} text-white selection:bg-blue-500/30 overflow-x-hidden pt-16 md:pt-0`;
      } else if (res.data?.themeChanges === null) {
         document.body.className = "bg-gray-950 text-white selection:bg-blue-500/30 overflow-x-hidden pt-16 md:pt-0";
      }
    } catch (e: any) {
      alert("AI action failed: " + (e.response?.data?.error || e.message));
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="p-4 md:p-10 max-w-7xl mx-auto"
    >
      <h1 className="text-3xl font-bold tracking-tight mb-8">Settings</h1>

      <div className="bg-gray-950 border border-gray-800 rounded-2xl p-8 mb-8">
        <h2 className="text-xl font-bold mb-4 flex items-center">
          <User className="mr-2 text-blue-400" /> My Account
        </h2>
        <p className="text-gray-400">Username: <strong className="text-white">{user.username}</strong></p>
        <p className="text-gray-400 mt-2">Role: <strong className="text-white capitalize">{user.role}</strong></p>
      </div>

      {user.role === "admin" && (
        <div className="bg-gray-950 border border-gray-800 rounded-2xl p-8">
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <Shield className="mr-2 text-purple-400" /> Admin: User Management
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 border-r border-gray-800 pr-8">
              <h3 className="font-semibold mb-4 text-gray-300">Create New User</h3>
              <form onSubmit={createUser} className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Username</label>
                  <input required value={username} onChange={e=>setUsername(e.target.value)} type="text" className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-white" />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Password</label>
                  <input required minLength={4} value={password} onChange={e=>setPassword(e.target.value)} type="password" className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-white" />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Role</label>
                  <select value={role} onChange={e=>setRole(e.target.value)} className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-white">
                    <option value="user">Normal User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <button className="w-full py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-medium transition-colors">
                  Create
                </button>
              </form>
            </div>
            <div className="lg:col-span-2">
               <h3 className="font-semibold mb-4 text-gray-300">Existing Users</h3>
               <div className="space-y-3">
                 {users.map(u => (
                   <div key={u.id} className="flex justify-between items-center p-4 bg-gray-900 border border-gray-800 rounded-xl">
                      <div>
                        <p className="font-medium text-white">{u.username}</p>
                        <p className="text-xs text-gray-500 capitalize">Role: {u.role}</p>
                      </div>
                      {u.id !== user.id && (
                        <button onClick={() => deleteUser(u.id)} className="p-2 text-red-500 bg-red-500/10 hover:bg-red-500/20 rounded-lg">
                          <Trash2 size={16} />
                        </button>
                      )}
                   </div>
                 ))}
               </div>
            </div>
          </div>
        </div>
      )}

      {user.role === "admin" && (
        <div className="bg-gray-950 border border-gray-800 rounded-2xl p-8 mt-8 border-t-4 border-t-purple-500/50">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold flex items-center">
              <Bot className="mr-2 text-emerald-400" /> AI Assistance (Beta)
            </h2>
            <span className="px-2.5 py-1 text-xs font-semibold bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-500/20">
              Admin Only
            </span>
          </div>
          
          <p className="text-gray-400 text-sm mb-6 max-w-2xl">
            Integrate AI capabilities directly into the control panel. Auto-manage the panel, fix bugs, or suggest general GUI improvements and theme changes.
          </p>

          <div className="space-y-6">
            {!hasApiKey ? (
               <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6">
                 <h3 className="text-red-400 font-medium mb-2 text-sm flex items-center">
                    Missing API Key
                 </h3>
                 <p className="text-red-400/80 text-xs mb-4">You need to provide a valid Gemini API Key to use the AI Assistance features.</p>
                 <div className="flex space-x-2">
                    <input 
                      type="password"
                      value={newApiKey}
                      onChange={(e) => setNewApiKey(e.target.value)}
                      placeholder="Enter Gemini API Key..."
                      className="flex-1 bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500/50"
                    />
                    <button 
                      onClick={handleSaveApiKey}
                      disabled={isKeySaving}
                      className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                    >
                      {isKeySaving ? "Verifying..." : "Save Key"}
                    </button>
                 </div>
               </div>
            ) : (
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 mb-6 flex justify-between items-center">
                    <div>
                        <h3 className="text-emerald-400 font-medium text-sm flex items-center">
                            API Key Configured
                        </h3>
                        <p className="text-emerald-400/80 text-xs mt-1">Your Gemini API key is active and ready to use.</p>
                    </div>
                    <button 
                        onClick={handleDeleteApiKey}
                        className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors border border-transparent hover:border-red-500/20"
                        title="Remove API Key"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Custom AI Prompt (optional)</label>
              <textarea 
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="E.g., Try to fix the server list loading bug, or change the background theme to dark red."
                className="w-full h-24 bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/50 transition-colors resize-none"
              ></textarea>
            </div>

            <div className="flex flex-wrap gap-4">
              <button 
                onClick={() => handleAiAction('fix_bug')}
                disabled={isAiLoading}
                className="flex items-center px-5 py-2.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 border border-blue-500/20 font-medium rounded-lg transition-colors disabled:opacity-50"
              >
                {isAiLoading ? <RefreshCw className="mr-2 w-5 h-5 animate-spin" /> : <Wrench className="mr-2 w-5 h-5" />}
                Fixing Bug
              </button>
              
              <button 
                onClick={() => handleAiAction('improve')}
                disabled={isAiLoading}
                className="flex items-center px-5 py-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 border border-emerald-500/20 font-medium rounded-lg transition-colors disabled:opacity-50"
              >
                {isAiLoading ? <RefreshCw className="mr-2 w-5 h-5 animate-spin" /> : <Zap className="mr-2 w-5 h-5" />}
                Improve Panel & GUI
              </button>
            </div>

            {aiResult && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 p-4 bg-gray-900 border border-gray-800 rounded-xl"
              >
                <div className="flex items-center mb-2">
                  <span className={`w-2 h-2 rounded-full mr-2 ${aiResult.status === 'fixed' || aiResult.status === 'success' ? 'bg-green-500' : 'bg-orange-500'}`}></span>
                  <h3 className="font-semibold text-gray-200 uppercase tracking-wide text-xs">AI Response</h3>
                </div>
                <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">{aiResult.details}</p>
                {aiResult.themeChanges && (
                  <div className="mt-3 text-xs text-gray-500">
                    Theme modifications applied: <code className="text-purple-400 bg-purple-400/10 px-1 py-0.5 rounded ml-1">{JSON.stringify(aiResult.themeChanges)}</code>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
}
