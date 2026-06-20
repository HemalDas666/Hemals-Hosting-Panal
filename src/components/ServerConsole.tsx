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
    <div className="flex flex-col flex-1 bg-gray-950 pb-2 md:pb-4 h-full min-h-0">
      <div className="flex flex-col flex-1 bg-[#111] rounded-xl border border-gray-800 overflow-hidden min-h-0 shadow-inner">
        <div className="flex-1 overflow-y-auto p-3 md:p-4 font-mono text-[11px] md:text-xs custom-scrollbar">
          <div className="mb-3 text-[10px] text-gray-500 flex items-center uppercase tracking-widest"><XTerm size={12} className="mr-2" /> Session started</div>
          {logs.map((log, i) => (
            <div key={i} className={`flex leading-[1.4] md:leading-snug mb-0.5 ${log.startsWith('>') ? 'font-semibold text-blue-400' : log.includes('Error') || log.includes('Exception') ? 'text-red-400' : 'text-gray-300 hover:bg-white/5'}`}>
               <span className="text-gray-600 mr-2 md:mr-3 select-none shrink-0 w-8 md:w-10 text-right pr-2 border-r border-gray-800">{String(i).padStart(4, '0')}</span> 
               <span className="break-all md:break-words flex-1 font-mono tracking-tight">{log}</span>
            </div>
          ))}
          <div ref={endRef} />
        </div>
        <form onSubmit={sendCommand} className="p-2 bg-[#090909] flex space-x-2 shrink-0 border-t border-gray-800">
          <div className="flex-1 flex items-center bg-[#1a1a1a] rounded px-3 border border-gray-800 focus-within:border-blue-500/50 transition-colors">
            <span className="text-green-500 font-mono mr-2 select-none text-sm">~$</span>
            <input 
              type="text" 
              value={command} 
              onChange={e => setCommand(e.target.value)}
              className="flex-1 bg-transparent py-2 text-gray-200 focus:outline-none font-mono text-xs md:text-sm"
              placeholder="Enter command..."
              spellCheck={false}
              autoComplete="off"
            />
          </div>
          <button type="submit" disabled={!command.trim()} className="px-4 py-2 bg-blue-600/20 text-blue-500 border border-blue-500/30 hover:bg-blue-600/30 font-medium rounded transition-colors text-xs disabled:opacity-50 disabled:cursor-not-allowed">
            Send
          </button>
        </form>
      </div>

      <div className="grid grid-cols-3 gap-2 md:gap-4 mt-3 md:mt-4 shrink-0">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-3 flex flex-col justify-center">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-1.5 md:mb-2">
            <p className="text-gray-400 text-[10px] md:text-xs font-semibold uppercase tracking-wider mb-0.5 md:mb-0">CPU</p>
            <p className="text-[10px] md:text-xs text-gray-500 font-mono">{stats.cpu.toFixed(1)}%</p>
          </div>
          <div className="w-full bg-gray-800 h-1.5 md:h-2 rounded-full overflow-hidden">
            <div className="bg-purple-500 h-full transition-all duration-500 rounded-full" style={{ width: `${Math.min((stats.cpu / stats.limitCpu) * 100, 100)}%` }}></div>
          </div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-3 flex flex-col justify-center">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-1.5 md:mb-2">
            <p className="text-gray-400 text-[10px] md:text-xs font-semibold uppercase tracking-wider mb-0.5 md:mb-0">RAM</p>
            <p className="text-[10px] md:text-xs text-gray-500 font-mono">{Math.floor(stats.ram)} MB</p>
          </div>
          <div className="w-full bg-gray-800 h-1.5 md:h-2 rounded-full overflow-hidden">
            <div className="bg-orange-500 h-full transition-all duration-500 rounded-full" style={{ width: `${Math.min((stats.ram / stats.limitRam) * 100, 100)}%` }}></div>
          </div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-3 flex flex-col justify-center">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-1.5 md:mb-2">
            <p className="text-gray-400 text-[10px] md:text-xs font-semibold uppercase tracking-wider mb-0.5 md:mb-0">Disk</p>
            <p className="text-[10px] md:text-xs text-gray-500 font-mono">{stats.disk.toFixed(1)} GB</p>
          </div>
          <div className="w-full bg-gray-800 h-1.5 md:h-2 rounded-full overflow-hidden">
            <div className="bg-blue-500 h-full transition-all duration-500 rounded-full" style={{ width: `${Math.min((stats.disk / stats.limitDisk) * 100, 100)}%` }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}
