import { Plus, Zap } from 'lucide-react';
import { NODE_TYPES } from '../../data/nodeTypes';

export default function NodePalette({ unlockedNodes, currentPoints, onAddNode }) {
  return (
    <aside className="custom-scrollbar absolute inset-x-0 bottom-0 z-20 flex max-h-40 shrink-0 flex-col overflow-hidden border-t border-slate-800 bg-slate-900/95 shadow-xl backdrop-blur md:static md:w-64 md:max-h-none md:overflow-y-auto md:border-r md:border-t-0 md:bg-slate-900">
      <div className="sticky top-0 border-b border-slate-800 bg-slate-900/90 p-3 backdrop-blur md:p-4">
        <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-slate-400">
          <Plus className="h-4 w-4" /> 节点仓库
        </h2>
      </div>
      <div className="custom-scrollbar flex gap-2 overflow-x-auto p-3 md:block md:space-y-2 md:overflow-visible">
        {unlockedNodes.map((typeKey) => {
          const definition = NODE_TYPES[typeKey];
          const isAffordable = currentPoints >= definition.cost;

          return (
            <div
              key={typeKey}
              onClick={() => isAffordable && onAddNode(typeKey)}
              className={`flex min-w-[12rem] cursor-pointer items-center justify-between rounded-lg border p-3 transition-all md:min-w-0 ${
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