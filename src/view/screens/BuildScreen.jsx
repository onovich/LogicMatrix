import { Trash2 } from 'lucide-react';
import { useRef, useState } from 'react';
import { CONNECTION_COST, NODE_TYPES, NODE_WIDTH } from '../../data/nodeTypes';
import { createBezierPath, getPortPos } from '../../logic/engine/graph';
import NodePalette from '../components/NodePalette';

export default function BuildScreen({
  nodes,
  setNodes,
  connections,
  setConnections,
  unlockedNodes,
  currentPoints,
  pan,
  setPan,
}) {
  const containerRef = useRef(null);
  const [drawingLine, setDrawingLine] = useState(null);

  const handlePointerDownBackground = (event) => {
    const isMousePanTrigger = event.pointerType === 'mouse'
      ? event.button === 2 || event.button === 1 || (event.button === 0 && event.target === containerRef.current)
      : event.target === containerRef.current;

    if (!isMousePanTrigger) {
      return;
    }

    const startX = event.clientX - pan.x;
    const startY = event.clientY - pan.y;

    const onPointerMove = (moveEvent) => {
      setPan({ x: moveEvent.clientX - startX, y: moveEvent.clientY - startY });
    };

    const onPointerUp = () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerUp);
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);
  };

  const addNode = (typeKey) => {
    const definition = NODE_TYPES[typeKey];

    if (currentPoints < definition.cost) {
      return;
    }

    setNodes((previous) => [
      ...previous,
      {
        id: `node_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        type: typeKey,
        x: -pan.x + window.innerWidth / 2 - NODE_WIDTH / 2,
        y: -pan.y + window.innerHeight / 2 - 100,
        value: 1,
      },
    ]);
  };

  const handleNodePointerDown = (event, nodeId) => {
    if ((event.pointerType === 'mouse' && event.button !== 0) || event.target.closest('.port-dot') || event.target.closest('input')) {
      return;
    }

    event.stopPropagation();

    const node = nodes.find((item) => item.id === nodeId);
    const offsetX = event.clientX - node.x;
    const offsetY = event.clientY - node.y;

    const onPointerMove = (moveEvent) => {
      setNodes((previous) =>
        previous.map((item) =>
          item.id === nodeId ? { ...item, x: moveEvent.clientX - offsetX, y: moveEvent.clientY - offsetY } : item,
        ),
      );
    };

    const onPointerUp = () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerUp);
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);
  };

  const deleteNode = (nodeId) => {
    setNodes((previous) => previous.filter((item) => item.id !== nodeId));
    setConnections((previous) => previous.filter((item) => item.fromNode !== nodeId && item.toNode !== nodeId));
  };

  const startConnection = (event, nodeId, portIndex, isOutput) => {
    event.stopPropagation();

    if (currentPoints < CONNECTION_COST || !isOutput) {
      return;
    }

    const node = nodes.find((item) => item.id === nodeId);
    const startPos = getPortPos(node, portIndex, true);

    setDrawingLine({
      fromNode: nodeId,
      fromPort: NODE_TYPES[node.type].outputs[portIndex],
      startX: startPos.x,
      startY: startPos.y,
      currentX: startPos.x,
      currentY: startPos.y,
    });

    const onPointerMove = (moveEvent) => {
      if (!containerRef.current) {
        return;
      }

      const rect = containerRef.current.getBoundingClientRect();
      setDrawingLine((previous) => ({
        ...previous,
        currentX: moveEvent.clientX - rect.left - pan.x,
        currentY: moveEvent.clientY - rect.top - pan.y,
      }));
    };

    const onPointerUp = (upEvent) => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerUp);

      const targetElement = document.elementFromPoint(upEvent.clientX, upEvent.clientY);
      if (targetElement && targetElement.classList.contains('port-dot-input')) {
        const toNodeId = targetElement.dataset.node;
        const toPortId = targetElement.dataset.port;

        if (toNodeId !== nodeId) {
          setConnections((previous) => {
            const filtered = previous.filter((item) => !(item.toNode === toNodeId && item.toPort === toPortId));

            return [
              ...filtered,
              {
                id: `conn_${Date.now()}`,
                fromNode: nodeId,
                fromPort: NODE_TYPES[node.type].outputs[portIndex],
                toNode: toNodeId,
                toPort: toPortId,
              },
            ];
          });
        }
      }

      setDrawingLine(null);
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);
  };

  const deleteConnection = (connectionId) => {
    setConnections((previous) => previous.filter((item) => item.id !== connectionId));
  };

  return (
    <div className="relative flex h-full w-full pb-40 md:pb-0">
      <NodePalette unlockedNodes={unlockedNodes} currentPoints={currentPoints} onAddNode={addNode} />
      <div
        className="relative flex-1 overflow-hidden bg-slate-950"
        onPointerDown={handlePointerDownBackground}
        onContextMenu={(event) => event.preventDefault()}
        ref={containerRef}
        style={{ touchAction: 'none' }}
      >
        <div
          className="pointer-events-none absolute inset-0 bg-grid-dots"
          style={{ backgroundSize: '40px 40px', backgroundPosition: `${pan.x}px ${pan.y}px`, opacity: 0.3 }}
        />

        <div className="absolute inset-0 origin-top-left" style={{ transform: `translate(${pan.x}px, ${pan.y}px)` }}>
          <svg className="absolute inset-0 z-0 h-full w-full overflow-visible pointer-events-none">
            {connections.map((connection) => {
              const fromNode = nodes.find((item) => item.id === connection.fromNode);
              const toNode = nodes.find((item) => item.id === connection.toNode);

              if (!fromNode || !toNode) {
                return null;
              }

              const fromDefinition = NODE_TYPES[fromNode.type];
              const toDefinition = NODE_TYPES[toNode.type];
              const fromPortIndex = Math.max(fromDefinition.outputs.indexOf(connection.fromPort), 0);
              const toPortIndex = Math.max(toDefinition.inputs.indexOf(connection.toPort), 0);
              const start = getPortPos(fromNode, fromPortIndex, true);
              const end = getPortPos(toNode, toPortIndex, false);

              return (
                <g key={connection.id} className="pointer-events-auto group cursor-crosshair">
                  <path
                    d={createBezierPath(start.x, start.y, end.x, end.y)}
                    fill="none"
                    onClick={() => deleteConnection(connection.id)}
                    stroke="transparent"
                    strokeWidth="15"
                  />
                  <path
                    d={createBezierPath(start.x, start.y, end.x, end.y)}
                    fill="none"
                    className="stroke-slate-400 transition-colors group-hover:stroke-red-500"
                    strokeDasharray={NODE_TYPES[toNode.type].type === 'action' ? '5,5' : 'none'}
                    strokeWidth="3"
                  />
                </g>
              );
            })}

            {drawingLine && (
              <path
                d={createBezierPath(
                  drawingLine.startX,
                  drawingLine.startY,
                  drawingLine.currentX,
                  drawingLine.currentY,
                )}
                fill="none"
                className="stroke-indigo-400"
                strokeDasharray="4,4"
                strokeWidth="3"
              />
            )}
          </svg>

          {nodes.map((node) => {
            const definition = NODE_TYPES[node.type];

            return (
              <div
                key={node.id}
                onPointerDown={(event) => handleNodePointerDown(event, node.id)}
                className="absolute z-10 flex flex-col rounded-lg border border-slate-700 bg-slate-800 text-slate-200 shadow-2xl transition-shadow hover:shadow-indigo-500/20"
                style={{ left: node.x, top: node.y, width: NODE_WIDTH }}
              >
                <div className={`flex items-center justify-between rounded-t-lg px-3 py-2 shadow-inner ${definition.color}`}>
                  <span className="truncate text-xs font-bold tracking-wide text-white drop-shadow-sm">{definition.name}</span>
                  <button
                    onClick={() => deleteNode(node.id)}
                    className="rounded p-1 text-white/60 transition-colors hover:bg-white/20 hover:text-white"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>

                <div className="relative min-h-[40px] py-2">
                  <div className="absolute bottom-0 left-0 top-2 flex flex-col gap-[14px]">
                    {definition.inputs.map((inputName, index) => (
                      <div key={`in_${index}`} className="relative -ml-[6px] flex items-center" title={inputName}>
                        <div
                          className="port-dot port-dot-input h-3 w-3 cursor-crosshair rounded-full border-2 border-slate-700 bg-slate-300 transition-colors hover:bg-white"
                          data-node={node.id}
                          data-port={inputName}
                        />
                        <span className="ml-1 scale-90 font-mono text-[10px] text-slate-400">{inputName}</span>
                      </div>
                    ))}
                  </div>

                  {definition.hasInput && (
                    <div className="flex justify-center px-4">
                      <input
                        type="number"
                        value={node.value}
                        onChange={(event) =>
                          setNodes((previous) =>
                            previous.map((item) =>
                              item.id === node.id ? { ...item, value: event.target.value } : item,
                            ),
                          )
                        }
                        className="w-20 rounded border border-slate-600 bg-slate-900 px-2 py-1 text-center font-mono text-xs text-emerald-400 focus:border-indigo-500 focus:outline-none"
                        onPointerDown={(event) => event.stopPropagation()}
                      />
                    </div>
                  )}

                  <div className="absolute bottom-0 right-0 top-2 flex flex-col items-end gap-[14px]">
                    {definition.outputs.map((outputName, index) => (
                      <div key={`out_${index}`} className="relative -mr-[6px] flex items-center" title={outputName}>
                        <span className="mr-1 scale-90 font-mono text-[10px] text-slate-400">{outputName}</span>
                        <div
                          className="port-dot h-3 w-3 cursor-crosshair rounded-full border-2 border-slate-700 bg-indigo-400 transition-colors hover:bg-indigo-300"
                          onPointerDown={(event) => startConnection(event, node.id, index, true)}
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