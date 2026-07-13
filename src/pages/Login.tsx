import React, { useState } from "react"; 
import { LoadingOverlay } from "../components/LoadingOverlay";
import { useAuth } from "../context/AuthContext";
import { useSettings } from "../context/SettingsContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Server } from "lucide-react";
import { motion } from "framer-motion";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const { panelName } = useSettings();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post("/api/auth/login", { username, password });
      login(res.data.token, res.data.user);
      navigate("/");
    } catch (err: any) {
      setError(err.response?.data?.error || "Login failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-transparent font-sans relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500/10 blur-[150px] rounded-full pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, type: "spring", stiffness: 300, damping: 25 }}
        className="max-w-[420px] w-full bg-black/40 backdrop-blur-3xl p-10 rounded-[2rem] shadow-[0_0_50px_-10px_rgba(0,0,0,0.8)] border border-white/10 ring-1 ring-white/5 relative z-10 m-4 overflow-hidden group"
      >
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />
        
        <div className="flex flex-col items-center mb-10 mt-2">
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-4 rounded-2xl mb-5 shadow-[0_0_20px_rgba(99,102,241,0.4)]">
            <Server className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-4xl font-black text-white tracking-tight drop-shadow-md">{panelName}</h2>
          <p className="text-indigo-400/80 font-bold uppercase tracking-widest text-[10px] mt-3">Authenticate to platform controls</p>
        </div>
        
        {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="bg-red-500/10 border border-red-500/30 text-red-400 p-3.5 rounded-xl text-sm mb-6 text-center font-medium shadow-inner"
            >
              {error}
            </motion.div>
        )}
        
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1.5">Username</label>
            <input 
              type="text" 
              className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all shadow-inner"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1.5">Password</label>
            <input 
              type="password" 
              className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all shadow-inner"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="w-full bg-white text-zinc-900 font-bold rounded-xl px-4 py-3.5 transition-all mt-4 hover:bg-zinc-200 active:scale-[0.98] shadow-lg shadow-white/10">
            Sign In
          </button>
        </form>
      </motion.div>
      {isLoading && <LoadingOverlay message="Logging in..." />}
    </div>
  );
}
