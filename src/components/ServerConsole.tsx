import React, { useEffect, useRef, useState } from "react";
import { Terminal as XTerm } from "lucide-react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "../context/AuthContext";
import axios from "axios";

export default function ServerConsole({ serverId }: { serverId: string }) {
  const [logs, setLogs] = useState<string[]>([]);
  const [command, setCommand] = useState("");
  const [stats, setStats] = useState({ cpu: 0, ram: 0, disk: 0, limitRam: 1024, limitCpu: 100, limitDisk: 10 });
  const endRef = useRef<HTMLDivElement>(null);
  const { token } = useAuth();

  useEffect(() => {
    const socket: Socket = io({
      auth: { token }
    });

    socket.on("connect", () => {
      socket.emit("joinServer", serverId);
      setLogs(prev => [...prev, "[System] Connected to console stream."]);
    });

    socket.on("log", (data: string) => {
      const lines = data.split(/\r?\n/).filter(line => line.trim() !== "");
      setLogs(prev => {
        const newLogs = [...prev, ...lines];
        return newLogs.slice(-200);
      });
    });

    socket.on("disconnect", () => {
      setLogs(prev => [...prev, "[System] Disconnected from server."]);
    });

    return () => {
      socket.emit("leaveServer", serverId);
      socket.disconnect();
    };
  }, [serverId, token]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get(`/api/servers/${serverId}/stats`);
        setStats(res.data);
      } catch (err) {}
    };
    fetchStats();
    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
  }, [serverId]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const sendCommand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!command.trim()) return;
    const cmd = command;
    setCommand("");
    try {
      await axios.post(`/api/servers/${serverId}/command`, { command: cmd });
    } catch(e) {
      setLogs(prev => [...prev, "[System Error] Failed to send command"]);
    }
  };

  return (
    <div className="flex flex-col flex-1 bg-gray-950 pb-4 h-full min-h-0">
      <div className="flex flex-col flex-1 bg-[#0a0a0a] rounded-2xl border border-gray-800/60 overflow-hidden shadow-2xl min-h-0 ring-1 ring-white/5">
        <div className="flex-1 overflow-y-auto p-5 font-mono text-xs md:text-sm custom-scrollbar whitespace-pre-wrap break-words text-gray-300">
          <div className="mb-4 text-xs text-gray-500 flex items-center uppercase tracking-widest"><XTerm size={14} className="mr-2" /> Session started</div>
          {logs.map((log, i) => (
            <div key={i} className={`py-[1px] ${log.startsWith('>') ? 'font-semibold text-blue-400' : log.includes('Error') || log.includes('Exception') ? 'text-red-400' : 'text-gray-300 hover:text-white transition-colors'}`}>
               <span className="opacity-30 mr-3 select-none">{String(i).padStart(4, '0')}</span> 
               {log}
            </div>
          ))}
          <div ref={endRef} />
        </div>
        <form onSubmit={sendCommand} className="p-3 bg-[#0f0f0f] flex space-x-2 shrink-0 border-t border-gray-800/60">
          <div className="flex-1 flex items-center bg-[#1a1a1a] rounded-lg px-3 border border-gray-800/80 focus-within:border-blue-500/50 focus-within:ring-1 focus-within:ring-blue-500/20 transition-all">
            <span className="text-blue-500 font-mono mr-2 select-none">❯</span>
            <input 
              type="text" 
              value={command} 
              onChange={e => setCommand(e.target.value)}
              className="flex-1 bg-transparent py-2.5 text-gray-200 focus:outline-none font-mono text-sm"
              placeholder="Send remote command..."
              spellCheck={false}
              autoComplete="off"
            />
          </div>
          <button type="submit" disabled={!command.trim()} className="px-5 py-2.5 bg-white text-black hover:bg-gray-200 font-medium rounded-lg transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed">
            Execute
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 shrink-0">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex flex-col">
          <div className="flex justify-between items-center mb-2">
            <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">CPU Usage</p>
            <p className="text-xs text-gray-500">{stats.cpu.toFixed(1)}% / {stats.limitCpu}%</p>
          </div>
          <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
            <div className="bg-purple-500 h-full transition-all duration-500 rounded-full" style={{ width: `${Math.min((stats.cpu / stats.limitCpu) * 100, 100)}%` }}></div>
          </div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex flex-col">
          <div className="flex justify-between items-center mb-2">
            <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">RAM Usage</p>
            <p className="text-xs text-gray-500">{Math.floor(stats.ram)} MB / {stats.limitRam} MB</p>
          </div>
          <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
            <div className="bg-orange-500 h-full transition-all duration-500 rounded-full" style={{ width: `${Math.min((stats.ram / stats.limitRam) * 100, 100)}%` }}></div>
          </div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex flex-col">
          <div className="flex justify-between items-center mb-2">
            <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Disk Usage</p>
            <p className="text-xs text-gray-500">{stats.disk.toFixed(1)} GB / {stats.limitDisk} GB</p>
          </div>
          <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
            <div className="bg-blue-500 h-full transition-all duration-500 rounded-full" style={{ width: `${Math.min((stats.disk / stats.limitDisk) * 100, 100)}%` }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}
