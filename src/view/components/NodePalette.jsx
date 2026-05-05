import { Plus, Zap } from 'lucide-react';
import { NODE_TYPES } from '../../data/nodeTypes';

export default function NodePalette({ unlockedNodes, currentPoints, onAddNode }) {
  return (
    <aside className="custom-scrollbar z-10 flex w-64 shrink-0 flex-col overflow-y-auto border-r border-slate-800 bg-slate-900 shadow-xl">
      <div className="sticky top-0 border-b border-slate-800 bg-slate-900/90 p-4 backdrop-blur">
        <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-slate-400">
          <Plus className="h-4 w-4" /> 节点仓库
        </h2>
      </div>
      <div className="space-y-2 p-3">
        {unlockedNodes.map((typeKey) => {
          const definition = NODE_TYPES[typeKey];
          const isAffordable = currentPoints >= definition.cost;

          return (
            <div
              key={typeKey}
              onClick={() => isAffordable && onAddNode(typeKey)}
              className={`flex cursor-pointer items-center justify-between rounded-lg border p-3 transition-all ${
                isAffordable
                  ? 'border-slate-700 bg-slate-800 hover:border-slate-500 hover:bg-slate-700/80'
                  : 'cursor-not-allowed border-slate-800/50 bg-slate-800/50 opacity-50'
              }`}
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${definition.color}`}></span>
                  <span className="text-sm font-medium text-slate-200">{definition.name}</span>
                </div>
                <div className="mt-1 text-xs text-slate-500">{definition.type.toUpperCase()}</div>
              </div>
              <div className="flex items-center gap-1 rounded bg-slate-900 px-2 py-1 text-xs font-mono text-slate-400">
                <Zap className="h-3 w-3 text-yellow-500" /> {definition.cost}
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
}