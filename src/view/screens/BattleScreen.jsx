import { Brain, Crosshair, ShieldAlert } from 'lucide-react';
import { useEffect, useMemo, useRef } from 'react';
import { ARENA_SIZE } from '../../data/nodeTypes';
import { useBattleSimulation } from '../../logic/hooks/useBattleSimulation';

export default function BattleScreen({ nodes, connections, level, onEnd }) {
  const { player, enemy, tickCount, logs } = useBattleSimulation({ nodes, connections, level, onEnd });
  const logContainerRef = useRef(null);
  const orderedLogs = useMemo(() => logs.slice(), [logs]);

  useEffect(() => {
    const container = logContainerRef.current;

    if (!container) {
      return;
    }

    container.scrollTop = container.scrollHeight;
  }, [orderedLogs]);

  const arena = Array.from({ length: ARENA_SIZE }, (_, index) => {
    const isPlayer = player.pos === index;
    const isEnemy = enemy.pos === index;

    return (
      <div key={index} className="relative flex h-16 flex-1 items-end justify-center border-b-4 border-slate-700 pb-2">
        {isPlayer && (
          <div className="animate-bounce-slow absolute -top-14 flex flex-col items-center">
            <span className="mb-1 whitespace-nowrap rounded border border-emerald-900 bg-slate-900 px-2 py-0.5 text-xs font-bold text-emerald-400">
              {player.actionLog}
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded border-2 border-white bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.5)]">
              <Brain className="h-6 w-6" />
            </div>
          </div>
        )}
        {isEnemy && (
          <div className="absolute -top-14 flex flex-col items-center">
            <span className="mb-1 whitespace-nowrap rounded border border-red-900 bg-slate-900 px-2 py-0.5 text-xs font-bold text-red-400">
              {enemy.actionLog}
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.5)]">
              <ShieldAlert className="h-6 w-6" />
            </div>
          </div>
        )}
        <div className="h-2 w-2 rounded-full bg-slate-800"></div>
      </div>
    );
  });

  return (
    <div className="relative flex flex-1 flex-col items-center bg-slate-900 py-8">
      <h2 className="mb-12 flex items-center gap-3 text-2xl font-black tracking-widest text-slate-300">
        <Crosshair className="h-8 w-8 text-red-500" />
        战斗演算进行中... [TICK: {tickCount}]
      </h2>

      <div className="relative z-10 mb-24 flex w-full max-w-4xl justify-between px-8">
        <div className="w-64">
          <div className="mb-1 flex justify-between font-bold text-emerald-400">
            <span>MY AI LOGIC</span>
            <span>{player.hp} / {player.maxHp}</span>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full border border-slate-700 bg-slate-800">
            <div className="h-full bg-emerald-500 transition-all duration-300" style={{ width: `${Math.max(0, (player.hp / player.maxHp) * 100)}%` }} />
          </div>
        </div>
        <div className="absolute left-1/2 text-center -translate-x-1/2">
          <span className="text-4xl font-black text-slate-700">VS</span>
        </div>
        <div className="w-64">
          <div className="mb-1 flex justify-between font-bold text-red-400">
            <span>{enemy.hp} / {enemy.maxHp}</span>
            <span>VIRUS.BOT [Lv.{level}]</span>
          </div>
          <div className="flex h-3 w-full justify-end overflow-hidden rounded-full border border-slate-700 bg-slate-800">
            <div className="h-full bg-red-500 transition-all duration-300" style={{ width: `${Math.max(0, (enemy.hp / enemy.maxHp) * 100)}%` }} />
          </div>
        </div>
      </div>

      <div className="mt-10 flex w-full max-w-5xl px-12">{arena}</div>

      <div className="relative mt-16 h-48 w-full max-w-2xl overflow-hidden rounded-lg border border-slate-800 bg-slate-950 p-4 shadow-inner">
        <div className="absolute left-4 top-2 text-xs font-bold uppercase text-slate-600">SYSTEM LOG</div>
        <div ref={logContainerRef} className="custom-scrollbar mt-4 flex h-full flex-col gap-1 overflow-y-auto pr-2">
          {orderedLogs.map((log, index) => (
            <div
              key={`${log}-${index}`}
              className={`font-mono text-sm transition-all ${index === orderedLogs.length - 1 ? 'text-indigo-300 opacity-100' : 'text-slate-500 opacity-70'}`}
            >
              {'>'} {log}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}