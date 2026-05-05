import { Brain, Play, RotateCcw, Zap } from 'lucide-react';
import { useState } from 'react';
import { INITIAL_GAME_STATE, INITIAL_LEVEL, INITIAL_MAX_POINTS } from './data/gameConfig';
import { CONNECTION_COST, INITIAL_UNLOCKED, NODE_TYPES } from './data/nodeTypes';
import BattleScreen from './view/screens/BattleScreen';
import BuildScreen from './view/screens/BuildScreen';
import DraftScreen from './view/screens/DraftScreen';

export default function App() {
  const [gameState, setGameState] = useState(INITIAL_GAME_STATE);
  const [level, setLevel] = useState(INITIAL_LEVEL);
  const [maxPoints, setMaxPoints] = useState(INITIAL_MAX_POINTS);
  const [unlockedNodes, setUnlockedNodes] = useState(INITIAL_UNLOCKED);
  const [nodes, setNodes] = useState([]);
  const [connections, setConnections] = useState([]);
  const [pan, setPan] = useState({ x: 0, y: 0 });

  const currentPoints =
    maxPoints -
    nodes.reduce((sum, node) => sum + NODE_TYPES[node.type].cost, 0) -
    connections.length * CONNECTION_COST;

  const startBattle = () => {
    setGameState('battle');
  };

  const handleBattleEnd = (isWin) => {
    if (isWin) {
      setMaxPoints((value) => value + 30);
      setGameState('draft');
      return;
    }

    setMaxPoints((value) => value + 10);
    setGameState('gameover');
  };

  const draftNode = (nodeId) => {
    if (!unlockedNodes.includes(nodeId)) {
      setUnlockedNodes((value) => [...value, nodeId]);
    }

    setLevel((value) => value + 1);
    setGameState('build');
  };

  return (
    <div className="flex h-screen w-full select-none flex-col overflow-hidden bg-slate-900 font-sans text-slate-100">
      <header className="z-10 flex h-14 shrink-0 items-center justify-between border-b border-slate-800 bg-slate-950 px-6 shadow-md">
        <div className="flex items-center gap-3">
          <Brain className="h-6 w-6 text-indigo-400" />
          <h1 className="text-xl font-bold tracking-wider text-slate-200">LOGIC MATRIX</h1>
          <span className="ml-4 rounded-full border border-slate-800 bg-slate-900 px-3 py-1 text-sm font-medium text-slate-500">
            Lv. {level}
          </span>
        </div>

        {gameState === 'build' && (
          <div className="flex items-center gap-6">
            <div
              className={`flex items-center gap-2 rounded-full border px-4 py-1.5 ${
                currentPoints < 0
                  ? 'border-red-900/50 bg-red-950/50 text-red-400'
                  : 'border-slate-700 bg-slate-900 text-emerald-400'
              }`}
            >
              <Zap className="h-4 w-4" />
              <span className="font-mono font-bold">
                {currentPoints} / {maxPoints} PTS
              </span>
            </div>
            <button
              onClick={startBattle}
              className="flex items-center gap-2 rounded-md bg-indigo-600 px-5 py-2 font-semibold text-white shadow-lg shadow-indigo-900/20 transition-colors hover:bg-indigo-500"
            >
              <Play className="h-4 w-4" fill="currentColor" />
              部署出战
            </button>
          </div>
        )}
      </header>

      <main className="relative flex flex-1 overflow-hidden">
        {gameState === 'build' && (
          <BuildScreen
            nodes={nodes}
            setNodes={setNodes}
            connections={connections}
            setConnections={setConnections}
            unlockedNodes={unlockedNodes}
            currentPoints={currentPoints}
            pan={pan}
            setPan={setPan}
          />
        )}
        {gameState === 'battle' && (
          <BattleScreen nodes={nodes} connections={connections} level={level} onEnd={handleBattleEnd} />
        )}
        {gameState === 'draft' && <DraftScreen unlockedNodes={unlockedNodes} onSelect={draftNode} />}
        {gameState === 'gameover' && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-slate-900/90 backdrop-blur-sm">
            <h2 className="mb-4 text-5xl font-black tracking-widest text-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]">
              SYSTEM FAILURE
            </h2>
            <p className="mb-8 text-lg text-slate-300">战斗失败，已获取 10 点残骸积分用于重构系统。</p>
            <button
              onClick={() => setGameState('build')}
              className="flex items-center gap-2 rounded-md border border-slate-600 bg-slate-800 px-8 py-3 font-bold text-white transition-all hover:scale-105 hover:bg-slate-700"
            >
              <RotateCcw className="h-5 w-5" />
              返回重构
            </button>
          </div>
        )}
      </main>
    </div>
  );
}