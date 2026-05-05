import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Play, RotateCcw, Crosshair, Zap, Brain, Activity, Plus, Trash2, ArrowRight, ShieldAlert, Heart, Scissors } from 'lucide-react';

// --- 游戏数据与节点定义 ---
const NODE_TYPES = {
  // 传感器 (无输入，有输出)
  Distance: { id: 'Distance', name: '敌我距离', type: 'sensor', inputs: [], outputs: ['val'], cost: 10, color: 'bg-blue-600' },
  PlayerHP: { id: 'PlayerHP', name: '自身血量', type: 'sensor', inputs: [], outputs: ['val'], cost: 10, color: 'bg-blue-600' },
  EnemyHP: { id: 'EnemyHP', name: '敌人血量', type: 'sensor', inputs: [], outputs: ['val'], cost: 10, color: 'bg-blue-600' },
  
  // 常数 (可调节)
  Constant: { id: 'Constant', name: '常数', type: 'value', inputs: [], outputs: ['val'], cost: 5, color: 'bg-gray-600', hasInput: true },
  
  // 逻辑运算
  GreaterThan: { id: 'GreaterThan', name: '大于 (A>B)', type: 'logic', inputs: ['A', 'B'], outputs: ['out'], cost: 10, color: 'bg-purple-600' },
  LessThan: { id: 'LessThan', name: '小于 (A<B)', type: 'logic', inputs: ['A', 'B'], outputs: ['out'], cost: 10, color: 'bg-purple-600' },
  Equals: { id: 'Equals', name: '等于 (A=B)', type: 'logic', inputs: ['A', 'B'], outputs: ['out'], cost: 10, color: 'bg-purple-600' },
  And: { id: 'And', name: '且 (A&B)', type: 'logic', inputs: ['A', 'B'], outputs: ['out'], cost: 15, color: 'bg-indigo-600' },
  Or: { id: 'Or', name: '或 (A|B)', type: 'logic', inputs: ['A', 'B'], outputs: ['out'], cost: 15, color: 'bg-indigo-600' },
  
  // 动作 (只有输入)
  ActionAttack: { id: 'ActionAttack', name: '执行: 攻击', type: 'action', inputs: ['Trigger'], outputs: [], cost: 20, color: 'bg-red-600' },
  ActionForward: { id: 'ActionForward', name: '执行: 前进', type: 'action', inputs: ['Trigger'], outputs: [], cost: 15, color: 'bg-emerald-600' },
  ActionBack: { id: 'ActionBack', name: '执行: 后退', type: 'action', inputs: ['Trigger'], outputs: [], cost: 15, color: 'bg-emerald-600' },
  ActionHeal: { id: 'ActionHeal', name: '执行: 治疗', type: 'action', inputs: ['Trigger'], outputs: [], cost: 25, color: 'bg-green-600' },
};

const INITIAL_UNLOCKED = ['Distance', 'Constant', 'GreaterThan', 'ActionAttack', 'ActionForward'];
const CONNECTION_COST = 5;

// --- 辅助数学与图形函数 ---
const NODE_WIDTH = 160;
const PORT_OFFSET_Y = 40;
const PORT_SPACING = 28;

const getPortPos = (node, portIndex, isOutput) => {
  return {
    x: node.x + (isOutput ? NODE_WIDTH : 0),
    y: node.y + PORT_OFFSET_Y + portIndex * PORT_SPACING + 6 // +6 for center of dot
  };
};

const createBezierPath = (startX, startY, endX, endY) => {
  const controlPointOffset = Math.max(Math.abs(endX - startX) / 2, 50);
  return `M ${startX} ${startY} C ${startX + controlPointOffset} ${startY}, ${endX - controlPointOffset} ${endY}, ${endX} ${endY}`;
};

// --- 主组件 ---
export default function App() {
  const [gameState, setGameState] = useState('build'); // 'build', 'battle', 'draft', 'gameover'
  const [level, setLevel] = useState(1);
  const [maxPoints, setMaxPoints] = useState(80);
  
  // 构筑状态
  const [unlockedNodes, setUnlockedNodes] = useState(INITIAL_UNLOCKED);
  const [nodes, setNodes] = useState([]);
  const [connections, setConnections] = useState([]);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  
  // 当前积分计算
  const currentPoints = maxPoints 
    - nodes.reduce((sum, n) => sum + NODE_TYPES[n.type].cost, 0)
    - connections.length * CONNECTION_COST;

  // --- 战斗逻辑与状态 ---
  const startBattle = () => {
    setGameState('battle');
  };

  const handleBattleEnd = (isWin) => {
    if (isWin) {
      setMaxPoints(prev => prev + 30);
      setGameState('draft');
    } else {
      setMaxPoints(prev => prev + 10);
      setGameState('gameover');
    }
  };

  const draftNode = (nodeId) => {
    if (!unlockedNodes.includes(nodeId)) {
      setUnlockedNodes(prev => [...prev, nodeId]);
    }
    setLevel(prev => prev + 1);
    setGameState('build');
  };

  return (
    <div className="w-full h-screen bg-slate-900 text-slate-100 flex flex-col font-sans overflow-hidden select-none">
      {/* 顶部导航条 */}
      <header className="h-14 bg-slate-950 border-b border-slate-800 flex items-center justify-between px-6 shrink-0 z-10 shadow-md">
        <div className="flex items-center gap-3">
          <Brain className="w-6 h-6 text-indigo-400" />
          <h1 className="font-bold text-xl tracking-wider text-slate-200">LOGIC MATRIX</h1>
          <span className="ml-4 text-sm font-medium text-slate-500 bg-slate-900 px-3 py-1 rounded-full border border-slate-800">
            Lv. {level}
          </span>
        </div>
        
        {gameState === 'build' && (
          <div className="flex items-center gap-6">
            <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full border ${currentPoints < 0 ? 'bg-red-950/50 border-red-900/50 text-red-400' : 'bg-slate-900 border-slate-700 text-emerald-400'}`}>
              <Zap className="w-4 h-4" />
              <span className="font-mono font-bold">{currentPoints} / {maxPoints} PTS</span>
            </div>
            <button 
              onClick={startBattle}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2 rounded-md font-semibold transition-colors shadow-lg shadow-indigo-900/20"
            >
              <Play className="w-4 h-4" fill="currentColor" />
              部署出战
            </button>
          </div>
        )}
      </header>

      {/* 主体内容 */}
      <main className="flex-1 relative overflow-hidden flex">
        {gameState === 'build' && (
          <BuildScreen 
            nodes={nodes} setNodes={setNodes} 
            connections={connections} setConnections={setConnections}
            unlockedNodes={unlockedNodes} currentPoints={currentPoints}
            pan={pan} setPan={setPan}
          />
        )}
        {gameState === 'battle' && (
          <BattleScreen 
            nodes={nodes} connections={connections} 
            level={level} onEnd={handleBattleEnd} 
          />
        )}
        {gameState === 'draft' && (
          <DraftScreen unlockedNodes={unlockedNodes} onSelect={draftNode} />
        )}
        {gameState === 'gameover' && (
          <div className="absolute inset-0 bg-slate-900/90 flex flex-col items-center justify-center backdrop-blur-sm z-50">
            <h2 className="text-5xl font-black text-red-500 mb-4 tracking-widest drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]">SYSTEM FAILURE</h2>
            <p className="text-slate-300 text-lg mb-8">战斗失败，已获取 10 点残骸积分用于重构系统。</p>
            <button 
              onClick={() => setGameState('build')}
              className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white px-8 py-3 rounded-md font-bold transition-all hover:scale-105"
            >
              <RotateCcw className="w-5 h-5" />
              返回重构
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

// --- 构筑界面 (画布) ---
function BuildScreen({ nodes, setNodes, connections, setConnections, unlockedNodes, currentPoints, pan, setPan }) {
  const containerRef = useRef(null);
  const [draggingNode, setDraggingNode] = useState(null);
  const [drawingLine, setDrawingLine] = useState(null); // { fromNode, fromPort, startX, startY, currentX, currentY }

  // 拖动画布
  const handleMouseDownBackground = (e) => {
    if (e.button === 2 || e.button === 1 || (e.button === 0 && e.target === containerRef.current)) {
      const startX = e.clientX - pan.x;
      const startY = e.clientY - pan.y;
      
      const onMouseMove = (moveEvent) => {
        setPan({ x: moveEvent.clientX - startX, y: moveEvent.clientY - startY });
      };
      const onMouseUp = () => {
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
      };
      
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    }
  };

  // 添加节点
  const addNode = (typeKey) => {
    const def = NODE_TYPES[typeKey];
    if (currentPoints < def.cost) return;
    
    setNodes(prev => [...prev, {
      id: `node_${Date.now()}_${Math.floor(Math.random()*1000)}`,
      type: typeKey,
      x: -pan.x + window.innerWidth / 2 - NODE_WIDTH / 2,
      y: -pan.y + window.innerHeight / 2 - 100,
      value: 1 // For constants
    }]);
  };

  // 拖动节点
  const handleNodeMouseDown = (e, nodeId) => {
    if (e.button !== 0 || e.target.closest('.port-dot') || e.target.closest('input')) return;
    e.stopPropagation();
    
    const node = nodes.find(n => n.id === nodeId);
    const offsetX = e.clientX - node.x;
    const offsetY = e.clientY - node.y;

    const onMouseMove = (moveEvent) => {
      setNodes(prev => prev.map(n => 
        n.id === nodeId ? { ...n, x: moveEvent.clientX - offsetX, y: moveEvent.clientY - offsetY } : n
      ));
    };

    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  // 删除节点
  const deleteNode = (nodeId) => {
    setNodes(prev => prev.filter(n => n.id !== nodeId));
    setConnections(prev => prev.filter(c => c.fromNode !== nodeId && c.toNode !== nodeId));
  };

  // 连线逻辑
  const startConnection = (e, nodeId, portIndex, isOutput) => {
    e.stopPropagation();
    if (currentPoints < CONNECTION_COST) return; // 没钱不能连线
    if (!isOutput) return; // 只能从输出端开始拉线 (为了简单实现)

    const node = nodes.find(n => n.id === nodeId);
    const startPos = getPortPos(node, portIndex, true);
    
    setDrawingLine({
      fromNode: nodeId,
      fromPort: NODE_TYPES[node.type].outputs[portIndex],
      startX: startPos.x,
      startY: startPos.y,
      currentX: startPos.x,
      currentY: startPos.y
    });

    const onMouseMove = (moveEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      setDrawingLine(prev => ({
        ...prev,
        currentX: moveEvent.clientX - rect.left - pan.x,
        currentY: moveEvent.clientY - rect.top - pan.y
      }));
    };

    const onMouseUp = (upEvent) => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      
      const targetElement = document.elementFromPoint(upEvent.clientX, upEvent.clientY);
      if (targetElement && targetElement.classList.contains('port-dot-input')) {
        const toNodeId = targetElement.dataset.node;
        const toPortId = targetElement.dataset.port;
        
        // 检查自身连线或重复连线
        if (toNodeId !== nodeId) {
          setConnections(prev => {
            // 移除目标端口已有的连线 (一个输入只能接一根线)
            const filtered = prev.filter(c => !(c.toNode === toNodeId && c.toPort === toPortId));
            return [...filtered, {
              id: `conn_${Date.now()}`,
              fromNode: nodeId,
              fromPort: NODE_TYPES[node.type].outputs[portIndex], // 简化处理，如果是多个输出可能需要精确匹配
              toNode: toNodeId,
              toPort: toPortId
            }];
          });
        }
      }
      setDrawingLine(null);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  const deleteConnection = (connId) => {
    setConnections(prev => prev.filter(c => c.id !== connId));
  };

  return (
    <div className="flex w-full h-full">
      {/* 侧边栏: 节点面板 */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col z-10 shrink-0 shadow-xl overflow-y-auto custom-scrollbar">
        <div className="p-4 border-b border-slate-800 sticky top-0 bg-slate-900/90 backdrop-blur">
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <Plus className="w-4 h-4" /> 节点仓库
          </h2>
        </div>
        <div className="p-3 space-y-2">
          {unlockedNodes.map(typeKey => {
            const def = NODE_TYPES[typeKey];
            const isAffordable = currentPoints >= def.cost;
            return (
              <div 
                key={typeKey} 
                onClick={() => isAffordable && addNode(typeKey)}
                className={`p-3 rounded-lg border ${isAffordable ? 'bg-slate-800 border-slate-700 hover:border-slate-500 cursor-pointer hover:bg-slate-700/80 transition-all' : 'bg-slate-800/50 border-slate-800/50 opacity-50 cursor-not-allowed'} flex justify-between items-center group`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${def.color.replace('bg-', 'bg-')}`}></span>
                    <span className="font-medium text-sm text-slate-200">{def.name}</span>
                  </div>
                  <div className="text-xs text-slate-500 mt-1">{def.type.toUpperCase()}</div>
                </div>
                <div className="flex items-center gap-1 text-xs font-mono text-slate-400 bg-slate-900 px-2 py-1 rounded">
                  <Zap className="w-3 h-3 text-yellow-500" /> {def.cost}
                </div>
              </div>
            );
          })}
        </div>
      </aside>

      {/* 无限画布 */}
      <div 
        className="flex-1 relative bg-slate-950 overflow-hidden"
        onMouseDown={handleMouseDownBackground}
        onContextMenu={(e) => e.preventDefault()}
        ref={containerRef}
      >
        {/* 背景网格 */}
        <div 
          className="absolute inset-0 pointer-events-none" 
          style={{ 
            backgroundSize: '40px 40px', 
            backgroundImage: 'radial-gradient(circle, #334155 1px, transparent 1px)',
            backgroundPosition: `${pan.x}px ${pan.y}px`,
            opacity: 0.3
          }} 
        />

        {/* 缩放平移容器 */}
        <div 
          className="absolute inset-0 origin-top-left"
          style={{ transform: `translate(${pan.x}px, ${pan.y}px)` }}
        >
          {/* 连线层 */}
          <svg className="absolute inset-0 pointer-events-none w-full h-full overflow-visible z-0">
            {connections.map(conn => {
              const fromNode = nodes.find(n => n.id === conn.fromNode);
              const toNode = nodes.find(n => n.id === conn.toNode);
              if (!fromNode || !toNode) return null;
              
              const fromDef = NODE_TYPES[fromNode.type];
              const toDef = NODE_TYPES[toNode.type];
              
              const fromPortIndex = fromDef.outputs.indexOf(conn.fromPort) !== -1 ? fromDef.outputs.indexOf(conn.fromPort) : 0;
              const toPortIndex = toDef.inputs.indexOf(conn.toPort) !== -1 ? toDef.inputs.indexOf(conn.toPort) : 0;
              
              const start = getPortPos(fromNode, fromPortIndex, true);
              const end = getPortPos(toNode, toPortIndex, false);
              
              return (
                <g key={conn.id} className="pointer-events-auto cursor-crosshair group">
                  <path 
                    d={createBezierPath(start.x, start.y, end.x, end.y)} 
                    fill="none" stroke="transparent" strokeWidth="15"
                    onClick={() => deleteConnection(conn.id)}
                  />
                  <path 
                    d={createBezierPath(start.x, start.y, end.x, end.y)} 
                    fill="none" 
                    className="stroke-slate-400 group-hover:stroke-red-500 transition-colors" 
                    strokeWidth="3" 
                    strokeDasharray={NODE_TYPES[toNode.type].type === 'action' ? '5,5' : 'none'}
                  />
                </g>
              );
            })}
            
            {drawingLine && (
              <path 
                d={createBezierPath(drawingLine.startX, drawingLine.startY, drawingLine.currentX, drawingLine.currentY)} 
                fill="none" className="stroke-indigo-400" strokeWidth="3" strokeDasharray="4,4"
              />
            )}
          </svg>

          {/* 节点层 */}
          {nodes.map(node => {
            const def = NODE_TYPES[node.type];
            return (
              <div 
                key={node.id}
                onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
                className={`absolute shadow-2xl rounded-lg border border-slate-700 bg-slate-800 text-slate-200 z-10 flex flex-col transition-shadow hover:shadow-indigo-500/20`}
                style={{ left: node.x, top: node.y, width: NODE_WIDTH }}
              >
                {/* 节点Header */}
                <div className={`px-3 py-2 rounded-t-lg flex justify-between items-center ${def.color} shadow-inner`}>
                  <span className="font-bold text-xs tracking-wide truncate text-white drop-shadow-sm">{def.name}</span>
                  <button 
                    onClick={() => deleteNode(node.id)}
                    className="text-white/60 hover:text-white hover:bg-white/20 p-1 rounded transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>

                {/* 节点主体 */}
                <div className="py-2 relative min-h-[40px]">
                  {/* 输入端 */}
                  <div className="absolute left-0 top-2 bottom-0 flex flex-col gap-[14px]">
                    {def.inputs.map((inp, i) => (
                      <div key={`in_${i}`} className="flex items-center -ml-[6px] relative" title={inp}>
                        <div 
                          className="w-3 h-3 bg-slate-300 rounded-full border-2 border-slate-700 cursor-crosshair hover:bg-white transition-colors port-dot port-dot-input"
                          data-node={node.id} data-port={inp}
                        />
                        <span className="ml-1 text-[10px] text-slate-400 font-mono scale-90">{inp}</span>
                      </div>
                    ))}
                  </div>

                  {/* 特殊组件: 常数输入框 */}
                  {def.hasInput && (
                    <div className="px-4 flex justify-center">
                      <input 
                        type="number" 
                        value={node.value} 
                        onChange={(e) => setNodes(prev => prev.map(n => n.id === node.id ? { ...n, value: e.target.value } : n))}
                        className="w-20 bg-slate-900 border border-slate-600 rounded px-2 py-1 text-xs text-center text-emerald-400 font-mono focus:outline-none focus:border-indigo-500"
                        onMouseDown={e => e.stopPropagation()}
                      />
                    </div>
                  )}

                  {/* 输出端 */}
                  <div className="absolute right-0 top-2 bottom-0 flex flex-col gap-[14px] items-end">
                    {def.outputs.map((out, i) => (
                      <div key={`out_${i}`} className="flex items-center -mr-[6px] relative" title={out}>
                        <span className="mr-1 text-[10px] text-slate-400 font-mono scale-90">{out}</span>
                        <div 
                          className="w-3 h-3 bg-indigo-400 rounded-full border-2 border-slate-700 cursor-crosshair hover:bg-indigo-300 transition-colors port-dot"
                          onMouseDown={(e) => startConnection(e, node.id, i, true)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// --- 战斗界面引擎 ---
const ARENA_SIZE = 12;

function BattleScreen({ nodes, connections, level, onEnd }) {
  const [player, setPlayer] = useState({ hp: 100, maxHp: 100, pos: 2, actionLog: '部署就绪' });
  // 敌人属性随等级提升
  const [enemy, setEnemy] = useState({ hp: 50 + level * 20, maxHp: 50 + level * 20, pos: 9, actionLog: '系统待命' });
  const [tickCount, setTickCount] = useState(0);
  const [isOver, setIsOver] = useState(false);
  const [logs, setLogs] = useState(["战斗初始化..."]);

  const addLog = (msg) => setLogs(prev => [msg, ...prev].slice(0, 10));

  // --- 逻辑树求值函数 ---
  const evaluateGraph = useCallback((battleState) => {
    // 寻找所有动作节点
    const actionNodes = nodes.filter(n => NODE_TYPES[n.type].type === 'action');
    let chosenAction = null;
    let maxTriggerValue = -Infinity;

    // 递归计算输入值
    const getInputValue = (targetNodeId, targetPortName, visited) => {
      if (visited.has(targetNodeId)) return 0; // 防环
      visited.add(targetNodeId);

      const conn = connections.find(c => c.toNode === targetNodeId && c.toPort === targetPortName);
      if (!conn) return 0; // 未连接的端口默认为0
      
      const sourceNode = nodes.find(n => n.id === conn.fromNode);
      if (!sourceNode) return 0;

      switch (sourceNode.type) {
        case 'Constant': return parseFloat(sourceNode.value) || 0;
        case 'Distance': return Math.abs(battleState.player.pos - battleState.enemy.pos);
        case 'PlayerHP': return battleState.player.hp;
        case 'EnemyHP': return battleState.enemy.hp;
        case 'GreaterThan': return getInputValue(sourceNode.id, 'A', new Set(visited)) > getInputValue(sourceNode.id, 'B', new Set(visited)) ? 1 : 0;
        case 'LessThan': return getInputValue(sourceNode.id, 'A', new Set(visited)) < getInputValue(sourceNode.id, 'B', new Set(visited)) ? 1 : 0;
        case 'Equals': return getInputValue(sourceNode.id, 'A', new Set(visited)) === getInputValue(sourceNode.id, 'B', new Set(visited)) ? 1 : 0;
        case 'And': return (getInputValue(sourceNode.id, 'A', new Set(visited)) > 0 && getInputValue(sourceNode.id, 'B', new Set(visited)) > 0) ? 1 : 0;
        case 'Or': return (getInputValue(sourceNode.id, 'A', new Set(visited)) > 0 || getInputValue(sourceNode.id, 'B', new Set(visited)) > 0) ? 1 : 0;
        default: return 0;
      }
    };

    // 评估所有动作，取Trigger值 > 0 且最大的一个执行（如果有多个同级，取第一个）
    for (const actionNode of actionNodes) {
      const triggerVal = getInputValue(actionNode.id, 'Trigger', new Set());
      if (triggerVal > 0 && triggerVal > maxTriggerValue) {
        maxTriggerValue = triggerVal;
        chosenAction = actionNode.type;
      }
    }
    return chosenAction;
  }, [nodes, connections]);

  // 敌方简易AI逻辑
  const enemyAI = (state) => {
    const dist = Math.abs(state.enemy.pos - state.player.pos);
    if (level >= 3 && state.enemy.hp < state.enemy.maxHp * 0.3 && dist < 3) return 'ActionBack';
    if (dist <= 1) return 'ActionAttack';
    return 'ActionForward';
  };

  // --- 战斗循环 ---
  useEffect(() => {
    if (isOver) return;

    const timer = setInterval(() => {
      setTickCount(t => t + 1);
      
      let pState = { ...player };
      let eState = { ...enemy };
      let logsToAdd = [];

      // 1. 决策
      const pAction = evaluateGraph({ player: pState, enemy: eState });
      const eAction = enemyAI({ player: pState, enemy: eState });

      pState.actionLog = '待命';
      eState.actionLog = '待命';

      // 2. 执行玩家动作
      if (pAction === 'ActionForward') {
        if (pState.pos < eState.pos - 1) { pState.pos++; pState.actionLog = '前进'; logsToAdd.push("玩家 向前移动"); }
      } else if (pAction === 'ActionBack') {
        if (pState.pos > 0) { pState.pos--; pState.actionLog = '后退'; logsToAdd.push("玩家 向后退"); }
      } else if (pAction === 'ActionAttack') {
        pState.actionLog = '攻击!';
        if (Math.abs(pState.pos - eState.pos) <= 1) {
          const dmg = 15;
          eState.hp -= dmg;
          logsToAdd.push(`玩家 攻击! 造成 ${dmg} 伤害`);
        } else {
          logsToAdd.push("玩家 攻击挥空...");
        }
      } else if (pAction === 'ActionHeal') {
        pState.hp = Math.min(pState.maxHp, pState.hp + 10);
        pState.actionLog = '治疗';
        logsToAdd.push("玩家 使用治疗模块，恢复 10 HP");
      } else {
         logsToAdd.push("玩家 逻辑矩阵未输出有效动作");
      }

      // 3. 检查敌人死亡
      if (eState.hp <= 0) {
        setPlayer(pState); setEnemy(eState);
        setLogs(prev => ["敌人已被摧毁，战斗胜利！", ...logsToAdd, ...prev].slice(0,10));
        setIsOver(true);
        setTimeout(() => onEnd(true), 2000);
        clearInterval(timer);
        return;
      }

      // 4. 执行敌人动作
      if (eAction === 'ActionForward') {
        if (eState.pos > pState.pos + 1) { eState.pos--; eState.actionLog = '前进'; logsToAdd.push("敌人 逼近"); }
      } else if (eAction === 'ActionBack') {
        if (eState.pos < ARENA_SIZE - 1) { eState.pos++; eState.actionLog = '后退'; logsToAdd.push("敌人 后退"); }
      } else if (eAction === 'ActionAttack') {
        eState.actionLog = '攻击!';
        if (Math.abs(pState.pos - eState.pos) <= 1) {
          const dmg = 10 + Math.floor(level * 2);
          pState.hp -= dmg;
          logsToAdd.push(`敌人 攻击! 造成 ${dmg} 伤害`);
        } else {
           logsToAdd.push("敌人 攻击挥空...");
        }
      }

      // 5. 检查玩家死亡
      if (pState.hp <= 0) {
        setPlayer(pState); setEnemy(eState);
        setLogs(prev => ["核心被摧毁，战斗失败！", ...logsToAdd, ...prev].slice(0,10));
        setIsOver(true);
        setTimeout(() => onEnd(false), 2000);
        clearInterval(timer);
        return;
      }

      setPlayer(pState);
      setEnemy(eState);
      if(logsToAdd.length > 0) {
         setLogs(prev => [...logsToAdd.reverse(), ...prev].slice(0, 15));
      }

    }, 800); // 每0.8秒一个tick

    return () => clearInterval(timer);
  }, [player, enemy, isOver, evaluateGraph, level, onEnd]);

  // 渲染场地格子
  const renderArena = () => {
    let cells = [];
    for (let i = 0; i < ARENA_SIZE; i++) {
      let isPlayer = player.pos === i;
      let isEnemy = enemy.pos === i;
      cells.push(
        <div key={i} className="flex-1 h-16 border-b-4 border-slate-700 relative flex items-end justify-center pb-2">
          {isPlayer && (
            <div className="absolute -top-14 flex flex-col items-center animate-bounce-slow">
              <span className="text-xs font-bold text-emerald-400 bg-slate-900 px-2 py-0.5 rounded border border-emerald-900 mb-1 whitespace-nowrap">{player.actionLog}</span>
              <div className="w-10 h-10 bg-emerald-500 rounded border-2 border-white shadow-[0_0_15px_rgba(16,185,129,0.5)] flex items-center justify-center text-white">
                <Brain className="w-6 h-6" />
              </div>
            </div>
          )}
          {isEnemy && (
            <div className="absolute -top-14 flex flex-col items-center">
              <span className="text-xs font-bold text-red-400 bg-slate-900 px-2 py-0.5 rounded border border-red-900 mb-1 whitespace-nowrap">{enemy.actionLog}</span>
              <div className="w-10 h-10 bg-red-500 rounded-full border-2 border-white shadow-[0_0_15px_rgba(239,68,68,0.5)] flex items-center justify-center text-white">
                <ShieldAlert className="w-6 h-6" />
              </div>
            </div>
          )}
          <div className="w-2 h-2 rounded-full bg-slate-800"></div>
        </div>
      );
    }
    return cells;
  };

  return (
    <div className="flex-1 flex flex-col items-center bg-slate-900 py-8 relative">
      <h2 className="text-2xl font-black text-slate-300 tracking-widest mb-12 flex items-center gap-3">
        <Crosshair className="w-8 h-8 text-red-500" />
        战斗演算进行中... [TICK: {tickCount}]
      </h2>

      {/* 双方状态条 */}
      <div className="w-full max-w-4xl px-8 flex justify-between mb-24 relative z-10">
        <div className="w-64">
          <div className="flex justify-between text-emerald-400 font-bold mb-1">
            <span>MY AI LOGIC</span>
            <span>{player.hp} / {player.maxHp}</span>
          </div>
          <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
            <div className="h-full bg-emerald-500 transition-all duration-300" style={{ width: `${Math.max(0, player.hp/player.maxHp*100)}%` }}></div>
          </div>
        </div>
        <div className="text-center absolute left-1/2 -translate-x-1/2">
           <span className="text-4xl font-black text-slate-700">VS</span>
        </div>
        <div className="w-64">
          <div className="flex justify-between text-red-400 font-bold mb-1">
            <span>{enemy.hp} / {enemy.maxHp}</span>
            <span>VIRUS.BOT [Lv.{level}]</span>
          </div>
          <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden border border-slate-700 flex justify-end">
             <div className="h-full bg-red-500 transition-all duration-300" style={{ width: `${Math.max(0, enemy.hp/enemy.maxHp*100)}%` }}></div>
          </div>
        </div>
      </div>

      {/* 战斗场地 */}
      <div className="w-full max-w-5xl flex px-12 mt-10">
        {renderArena()}
      </div>

      {/* 战斗日志 */}
      <div className="mt-16 w-full max-w-2xl bg-slate-950 border border-slate-800 rounded-lg p-4 h-48 overflow-hidden relative shadow-inner">
         <div className="absolute top-2 left-4 text-xs font-bold text-slate-600 uppercase">SYSTEM LOG</div>
         <div className="mt-4 flex flex-col gap-1">
            {logs.map((log, i) => (
              <div key={i} className={`text-sm font-mono ${i===0 ? 'text-indigo-300 opacity-100' : 'text-slate-500 opacity-70'} transition-all`}>
                {'>'} {log}
              </div>
            ))}
         </div>
      </div>
    </div>
  );
}

// --- 肉鸽三选一界面 ---
function DraftScreen({ unlockedNodes, onSelect }) {
  // 生成三个未解锁或稀有的节点
  const availableKeys = Object.keys(NODE_TYPES).filter(k => !unlockedNodes.includes(k) && k !== 'ActionAttack' && k !== 'ActionForward' && k !== 'Distance' && k !== 'Constant');
  
  // 如果所有都解锁了，随便给三个或者给纯积分奖励 (这里简化为随机给3个)
  const pool = availableKeys.length >= 3 ? availableKeys : Object.keys(NODE_TYPES);
  
  // 随机取3个不重复的
  const shuffled = [...pool].sort(() => 0.5 - Math.random());
  const options = shuffled.slice(0, 3);

  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-slate-900 p-8">
       <div className="text-center mb-12 animate-fade-in">
          <h2 className="text-4xl font-black text-amber-400 mb-4 tracking-widest drop-shadow-lg">VICTORY</h2>
          <p className="text-slate-400 text-lg">解析敌方残骸... 发现新的逻辑模块。请选择一项集成到系统中。</p>
          <p className="text-emerald-400 text-sm mt-2 font-mono">+30 系统上限积分</p>
       </div>

       <div className="flex gap-8">
          {options.map((key, i) => {
             const def = NODE_TYPES[key];
             return (
               <div 
                  key={i}
                  onClick={() => onSelect(key)}
                  className="w-64 h-80 bg-slate-800 border-2 border-slate-700 rounded-xl p-6 flex flex-col justify-between cursor-pointer hover:border-amber-400 hover:scale-105 hover:bg-slate-750 transition-all group shadow-2xl relative overflow-hidden"
               >
                  <div className={`absolute -right-10 -top-10 w-32 h-32 rounded-full ${def.color} opacity-10 blur-2xl group-hover:opacity-30 transition-opacity`}></div>
                  
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                       <span className={`w-4 h-4 rounded ${def.color}`}></span>
                       <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{def.type} NODE</span>
                    </div>
                    <h3 className="text-2xl font-black text-white mb-2">{def.name}</h3>
                    <div className="flex gap-2 flex-wrap">
                       {def.inputs.map(inp => <span key={inp} className="text-xs px-2 py-1 bg-slate-900 border border-slate-700 rounded text-slate-300">入: {inp}</span>)}
                       {def.outputs.map(out => <span key={out} className="text-xs px-2 py-1 bg-indigo-900/30 border border-indigo-800/50 rounded text-indigo-300">出: {out}</span>)}
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-700 flex justify-between items-center text-slate-400 group-hover:text-amber-400 transition-colors">
                     <span className="text-sm font-bold flex items-center gap-1"><Zap className="w-4 h-4"/> 消耗: {def.cost}</span>
                     <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity -translate-x-4 group-hover:translate-x-0 transform duration-300" />
                  </div>
               </div>
             )
          })}
       </div>
    </div>
  );
}