import React, { useState } from "react";
import { Users, Shield, Gavel, UserMinus, ShieldAlert, Check } from "lucide-react";
import axios from "axios";

export default function PlayerManager({ serverId, players }: { serverId: string, players: {name: string}[] }) {
  const [loadingAction, setLoadingAction] = useState<{player: string, action: string} | null>(null);
  
  const handleAction = async (player: string, action: string, command: string) => {
    try {
      setLoadingAction({ player, action });
      await axios.post(`/api/servers/${serverId}/command`, { command });
    } catch(e) {
      console.error(e);
    } finally {
      setTimeout(() => setLoadingAction(null), 1000);
    }
  };

  return (
    <div id="player-manager" className="mt-6 md:mt-8 bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-[0_0_40px_-15px_rgba(0,0,0,0.5)] ring-1 ring-white/5 relative group">
      <div className="absolute inset-0 overflow-hidden rounded-xl pointer-events-none">
        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-indigo-500/10 blur-[100px] rounded-full" />
        <div className="absolute top-0 left-1/4 w-32 h-32 bg-emerald-500/5 blur-[80px] rounded-full" />
      </div>

      <div className="p-4 md:p-6 border-b border-white/5 flex justify-between items-center relative z-10">
        <div>
          <h3 className="text-xl font-black text-white flex items-center tracking-tight drop-shadow-md">
            <Users className="w-5 h-5 mr-2 text-indigo-400" />
            Player Manager
          </h3>
          <p className="text-[11px] font-bold text-indigo-400/80 uppercase tracking-widest mt-1">
            {players.length} {players.length === 1 ? 'player' : 'players'} online
          </p>
        </div>
      </div>

      <div className="relative z-10 divide-y divide-white/5 overflow-y-auto max-h-[50vh] md:max-h-none custom-scrollbar touch-auto overscroll-y-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
        {players.length === 0 ? (
          <div className="p-8 text-center text-zinc-500 flex flex-col items-center">
            <Users className="w-8 h-8 mb-3 text-zinc-700" />
            No players currently online.
          </div>
        ) : (
          players.map((player) => (
            <div key={player.name} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-white/[0.01] transition-colors">
              <div className="flex items-center gap-3">
                <img 
                  src={`https://minotar.net/avatar/${player.name}/32.png`} 
                  alt={player.name}
                  className="w-8 h-8 rounded-md bg-zinc-800"
                  onError={(e) => { (e.target as HTMLImageElement).src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAAAAABW71eEAAAARElEQVR42mP8/58BDBjhGqgEho+B4aNg+BgYPgYqMECnEQ9s2IDiH2w4j6QY9EEDX8n20AdVDPqggS/4+tEHDXzB1w8AYU7y34W8vU0AAAAASUVORK5CYII='; }}
                />
                <span className="font-medium text-zinc-200">{player.name}</span>
              </div>
              <div className="flex flex-wrap md:flex-nowrap items-center gap-2 w-full md:w-auto mt-2 md:mt-0">
                <button 
                  onClick={() => handleAction(player.name, 'op', `op ${player.name}`)}
                  className="flex-1 md:flex-none px-3 py-2.5 md:py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-lg text-xs md:text-sm font-medium flex justify-center items-center transition-colors"
                >
                  {loadingAction?.player === player.name && loadingAction?.action === 'op' ? <Check className="w-4 h-4 md:w-3.5 md:h-3.5 mr-1.5" /> : <Shield className="w-4 h-4 md:w-3.5 md:h-3.5 mr-1.5" />}
                  Make OP
                </button>
                <button 
                  onClick={() => handleAction(player.name, 'kick', `kick ${player.name} Kicked by admin.`)}
                  className="flex-1 md:flex-none px-3 py-2.5 md:py-1.5 bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-orange-500/20 rounded-lg text-xs md:text-sm font-medium flex justify-center items-center transition-colors"
                >
                  {loadingAction?.player === player.name && loadingAction?.action === 'kick' ? <Check className="w-4 h-4 md:w-3.5 md:h-3.5 mr-1.5" /> : <UserMinus className="w-4 h-4 md:w-3.5 md:h-3.5 mr-1.5" />}
                  Kick
                </button>
                <button 
                  onClick={() => handleAction(player.name, 'ban', `ban ${player.name} Banned by admin.`)}
                  className="flex-1 md:flex-none px-3 py-2.5 md:py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-lg text-xs md:text-sm font-medium flex justify-center items-center transition-colors"
                >
                  {loadingAction?.player === player.name && loadingAction?.action === 'ban' ? <Check className="w-4 h-4 md:w-3.5 md:h-3.5 mr-1.5" /> : <Gavel className="w-4 h-4 md:w-3.5 md:h-3.5 mr-1.5" />}
                  Ban
                </button>
                <button 
                  onClick={() => handleAction(player.name, 'ban-ip', `ban-ip ${player.name}`)}
                  className="flex-1 md:flex-none px-3 py-2.5 md:py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-lg text-xs md:text-sm font-medium flex justify-center items-center transition-colors"
                >
                  {loadingAction?.player === player.name && loadingAction?.action === 'ban-ip' ? <Check className="w-4 h-4 md:w-3.5 md:h-3.5 mr-1.5" /> : <ShieldAlert className="w-4 h-4 md:w-3.5 md:h-3.5 mr-1.5" />}
                  Ban IP
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
