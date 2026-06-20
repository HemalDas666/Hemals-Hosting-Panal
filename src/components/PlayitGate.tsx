import React, { useState, useEffect } from "react";
import axios from "axios";
import { Play, Copy, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function PlayitGate({ serverId }: { serverId: string }) {
  const [loading, setLoading] = useState(false);
  const [claimUrl, setClaimUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const fetchStatus = async () => {
    try {
      const res = await axios.get(`/api/servers/${serverId}/playit`);
      if (res.data.claimUrl) {
        setClaimUrl(res.data.claimUrl);
      }
      if (res.data.logs) {
        setLogs(res.data.logs);
      }
    } catch (e) {
      // ignore
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 3000);
    return () => clearInterval(interval);
  }, [serverId]);

  const startPlayit = async () => {
    setLoading(true);
    try {
      await axios.post(`/api/servers/${serverId}/playit/start`);
      // Start polling immediately
      fetchStatus();
    } catch (e) {
      // alert or log error
    } finally {
      setLoading(false);
    }
  };

  const copyLink = () => {
    if (claimUrl) {
      navigator.clipboard.writeText(claimUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex flex-col flex-1 bg-gray-950 pb-4 min-h-0">
      <div className="bg-gray-900 rounded-2xl border border-gray-800 p-8 flex flex-col items-center justify-center text-center shadow-lg flex-1 min-h-0 overflow-y-auto">
        <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-6 border border-blue-500/20">
          <Play className="w-8 h-8 text-blue-500" />
        </div>
        
        <h2 className="text-2xl font-bold text-white tracking-tight mb-2">Playit Tunnel</h2>
        <p className="text-gray-400 max-w-md mx-auto mb-8">
          Setup a global proxy for your server. Click the button below to install and start the Playit agent.
        </p>

        {claimUrl ? (
          <div className="w-full max-w-lg mb-8">
            <div className="bg-gray-950 border border-green-500/30 rounded-xl p-4 flex items-center justify-between shadow-[0_0_15px_rgba(34,197,94,0.1)]">
              <div className="text-left font-mono truncate text-green-400 pr-4">
                {claimUrl}
              </div>
              <button 
                onClick={copyLink}
                className="p-2 bg-gray-900 hover:bg-gray-800 rounded-lg text-gray-300 transition-colors"
                title="Copy link"
              >
                {copied ? <CheckCircle className="text-green-500 w-5 h-5" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>
            <p className="text-green-400/80 text-sm mt-3 animate-pulse">
              Playit agent is running! Copy the link and paste it in your browser to bind the tunnel.
            </p>
          </div>
        ) : (
          <button
            onClick={startPlayit}
            disabled={loading}
            className={`px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl transition-all shadow-[0_0_15px_rgba(37,99,235,0.3)] disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {loading ? "Starting..." : "Start Playit"}
          </button>
        )}

        {logs.length > 0 && (
          <div className="mt-8 w-full max-w-2xl text-left bg-gray-950 p-4 rounded-xl border border-gray-800 font-mono text-xs text-gray-400 overflow-y-auto max-h-40">
            {logs.map((log, i) => (
              <div key={i}>{log}</div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
