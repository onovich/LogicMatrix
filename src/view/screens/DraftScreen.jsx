import { ArrowRight, Zap } from 'lucide-react';
import { NODE_TYPES } from '../../data/nodeTypes';

export default function DraftScreen({ unlockedNodes, onSelect }) {
  const availableKeys = Object.keys(NODE_TYPES).filter(
    (key) => !unlockedNodes.includes(key) && !['ActionAttack', 'ActionForward', 'Distance', 'Constant'].includes(key),
  );

  const pool = availableKeys.length >= 3 ? availableKeys : Object.keys(NODE_TYPES);
  const options = [...pool].sort(() => 0.5 - Math.random()).slice(0, 3);

  return (
    <div className="flex flex-1 flex-col items-center justify-center overflow-y-auto bg-slate-900 px-4 py-4 lg:px-6 lg:py-5">
      <div className="animate-fade-in mb-5 text-center lg:mb-6">
        <h2 className="mb-1.5 text-[1.75rem] font-black tracking-[0.22em] text-amber-400 drop-shadow-lg lg:text-[1.9rem]">VICTORY</h2>
        <p className="text-xs text-slate-400 lg:text-sm">解析敌方残骸，选择一项新模块并接入系统。</p>
        <p className="mt-1.5 font-mono text-xs text-emerald-400">+30 系统上限积分</p>
      </div>

      <div className="grid w-full max-w-[58rem] grid-cols-1 gap-2.5 md:grid-cols-2 xl:grid-cols-3 xl:gap-3">
        {options.map((key) => {
          const definition = NODE_TYPES[key];

          return (
            <div
              key={key}
              onClick={() => onSelect(key)}
              className="group relative flex min-h-[11.75rem] cursor-pointer flex-col justify-between overflow-hidden rounded-2xl border border-slate-700/80 bg-[linear-gradient(180deg,rgba(30,41,59,0.92),rgba(15,23,42,0.98))] p-3.5 shadow-[0_18px_40px_rgba(2,6,23,0.35)] transition-all hover:-translate-y-1 hover:border-amber-400/70 hover:shadow-[0_22px_50px_rgba(245,158,11,0.12)]"
            >
              <div className={`absolute -right-12 -top-12 h-28 w-28 rounded-full opacity-10 blur-2xl transition-opacity group-hover:opacity-25 ${definition.color}`}></div>
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>

              <div className="space-y-2.5">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className={`h-3 w-3 rounded-sm ${definition.color}`}></span>
                    <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">{definition.type} NODE</span>
                  </div>
                  <div className="rounded-full border border-slate-700 bg-slate-900/70 px-2 py-0.5 text-[10px] font-mono text-slate-400">
                    {definition.cost} PTS
                  </div>
                </div>
                <div>
                  <h3 className="text-base font-black leading-tight text-white lg:text-[1.05rem]">{definition.name}</h3>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {definition.inputs.map((inputName) => (
                    <span key={inputName} className="rounded-md border border-slate-700 bg-slate-900/80 px-2 py-1 text-[11px] text-slate-300">
                      入: {inputName}
                    </span>
                  ))}
                  {definition.outputs.map((outputName) => (
                    <span key={outputName} className="rounded-md border border-indigo-800/50 bg-indigo-900/20 px-2 py-1 text-[11px] text-indigo-300">
                      出: {outputName}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-2 flex items-center justify-between border-t border-slate-700/80 pt-2.5 text-slate-400 transition-colors group-hover:text-amber-300">
                <span className="flex items-center gap-1 text-xs font-bold uppercase tracking-[0.16em]">
                  <Zap className="h-3.5 w-3.5" /> 选择升级
                </span>
                <ArrowRight className="h-4 w-4 -translate-x-2 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}