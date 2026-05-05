import { ArrowRight, Zap } from 'lucide-react';
import { NODE_TYPES } from '../../data/nodeTypes';

export default function DraftScreen({ unlockedNodes, onSelect }) {
  const availableKeys = Object.keys(NODE_TYPES).filter(
    (key) => !unlockedNodes.includes(key) && !['ActionAttack', 'ActionForward', 'Distance', 'Constant'].includes(key),
  );

  const pool = availableKeys.length >= 3 ? availableKeys : Object.keys(NODE_TYPES);
  const options = [...pool].sort(() => 0.5 - Math.random()).slice(0, 3);

  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-slate-900 p-8">
      <div className="animate-fade-in mb-12 text-center">
        <h2 className="mb-4 text-4xl font-black tracking-widest text-amber-400 drop-shadow-lg">VICTORY</h2>
        <p className="text-lg text-slate-400">解析敌方残骸... 发现新的逻辑模块。请选择一项集成到系统中。</p>
        <p className="mt-2 font-mono text-sm text-emerald-400">+30 系统上限积分</p>
      </div>

      <div className="flex gap-8 max-lg:flex-col">
        {options.map((key) => {
          const definition = NODE_TYPES[key];

          return (
            <div
              key={key}
              onClick={() => onSelect(key)}
              className="group relative flex h-80 w-64 cursor-pointer flex-col justify-between overflow-hidden rounded-xl border-2 border-slate-700 bg-slate-800 p-6 shadow-2xl transition-all hover:scale-105 hover:border-amber-400 hover:bg-slate-750"
            >
              <div className={`absolute -right-10 -top-10 h-32 w-32 rounded-full opacity-10 blur-2xl transition-opacity group-hover:opacity-30 ${definition.color}`}></div>

              <div>
                <div className="mb-4 flex items-center gap-3">
                  <span className={`h-4 w-4 rounded ${definition.color}`}></span>
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-400">{definition.type} NODE</span>
                </div>
                <h3 className="mb-2 text-2xl font-black text-white">{definition.name}</h3>
                <div className="flex flex-wrap gap-2">
                  {definition.inputs.map((inputName) => (
                    <span key={inputName} className="rounded border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-slate-300">
                      入: {inputName}
                    </span>
                  ))}
                  {definition.outputs.map((outputName) => (
                    <span key={outputName} className="rounded border border-indigo-800/50 bg-indigo-900/30 px-2 py-1 text-xs text-indigo-300">
                      出: {outputName}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-slate-700 pt-4 text-slate-400 transition-colors group-hover:text-amber-400">
                <span className="flex items-center gap-1 text-sm font-bold">
                  <Zap className="h-4 w-4" /> 消耗: {definition.cost}
                </span>
                <ArrowRight className="h-5 w-5 -translate-x-4 transform opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}