import { Trash2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { CONNECTION_COST, NODE_TYPES, NODE_WIDTH } from '../../data/nodeTypes';
import { createBezierPath, getPortPos } from '../../logic/engine/graph';
import NodePalette from '../components/NodePalette';

const MIN_ZOOM = 0.65;
const MAX_ZOOM = 1.8;

function clampZoom(value) {
  return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, value));
}

function getDistance(firstPoint, secondPoint) {
  return Math.hypot(secondPoint.x - firstPoint.x, secondPoint.y - firstPoint.y);
}

function getMidpoint(firstPoint, secondPoint) {
  return {
    x: (firstPoint.x + secondPoint.x) / 2,
    y: (firstPoint.y + secondPoint.y) / 2,
  };
}

function getZoomFactor(deltaY) {
  return Math.exp(-deltaY * 0.0015);
}

function isCanvasGestureTarget(target) {
  return !target.closest('[data-canvas-node="true"], input, button, .port-dot');
}

export default function BuildScreen({
  nodes,
  setNodes,
  connections,
  setConnections,
  unlockedNodes,
  currentPoints,
  pan,
  setPan,
  zoom,
  setZoom,
}) {
  const containerRef = useRef(null);
  const panRef = useRef(pan);
  const zoomRef = useRef(zoom);
  const activePointersRef = useRef(new Map());
  const gestureRef = useRef(null);
  const [drawingLine, setDrawingLine] = useState(null);

  useEffect(() => {
    panRef.current = pan;
  }, [pan]);

  useEffect(() => {
    zoomRef.current = zoom;
  }, [zoom]);

  useEffect(() => {
    const container = containerRef.current;

    if (!container) {
      return undefined;
    }

    const handleWheel = (event) => {
      if (!containerRef.current) {
        return;
      }

      event.preventDefault();

      const currentZoom = zoomRef.current;
      const localPoint = getLocalPoint(event.clientX, event.clientY);
      const worldPoint = {
        x: (localPoint.x - panRef.current.x) / currentZoom,
        y: (localPoint.y - panRef.current.y) / currentZoom,
      };
      const nextZoom = clampZoom(currentZoom * getZoomFactor(event.deltaY));

      if (nextZoom === currentZoom) {
        return;
      }

      const nextPan = {
        x: localPoint.x - worldPoint.x * nextZoom,
        y: localPoint.y - worldPoint.y * nextZoom,
      };

      setZoom(nextZoom);
      setPan(nextPan);
    };

    container.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      container.removeEventListener('wheel', handleWheel);
    };
  }, [setPan, setZoom]);

  const getLocalPoint = (clientX, clientY) => {
    const rect = containerRef.current?.getBoundingClientRect();

    if (!rect) {
      return { x: 0, y: 0 };
    }

    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  const getWorldPoint = (clientX, clientY, panValue = panRef.current, zoomValue = zoomRef.current) => {
    const localPoint = getLocalPoint(clientX, clientY);

    return {
      x: (localPoint.x - panValue.x) / zoomValue,
      y: (localPoint.y - panValue.y) / zoomValue,
    };
  };

  const startPanGesture = (pointer) => {
    gestureRef.current = {
      type: 'pan',
      pointerId: pointer.id,
      startClient: { x: pointer.x, y: pointer.y },
      startPan: panRef.current,
    };
  };

  const startPinchGesture = () => {
    const pointers = Array.from(activePointersRef.current.values());

    if (pointers.length < 2) {
      return;
    }

    const [firstPoint, secondPoint] = pointers;
    const startMidpoint = getMidpoint(firstPoint, secondPoint);
    const localMidpoint = getLocalPoint(startMidpoint.x, startMidpoint.y);

    gestureRef.current = {
      type: 'pinch',
      startDistance: getDistance(firstPoint, secondPoint),
      startZoom: zoomRef.current,
      worldMidpoint: {
        x: (localMidpoint.x - panRef.current.x) / zoomRef.current,
        y: (localMidpoint.y - panRef.current.y) / zoomRef.current,
      },
    };
  };

  const handlePointerMoveBackground = (event) => {
    const pointer = activePointersRef.current.get(event.pointerId);

    if (!pointer) {
      return;
    }

    activePointersRef.current.set(event.pointerId, {
      ...pointer,
      x: event.clientX,
      y: event.clientY,
    });

    const gesture = gestureRef.current;

    if (!gesture) {
      return;
    }

    if (gesture.type === 'pan') {
      const nextPointer = activePointersRef.current.get(gesture.pointerId);

      if (!nextPointer) {
        return;
      }

      setPan({
        x: gesture.startPan.x + (nextPointer.x - gesture.startClient.x),
        y: gesture.startPan.y + (nextPointer.y - gesture.startClient.y),
      });
      return;
    }

    if (gesture.type === 'pinch') {
      const pointers = Array.from(activePointersRef.current.values());

      if (pointers.length < 2) {
        return;
      }

      const [firstPoint, secondPoint] = pointers;
      const midpoint = getMidpoint(firstPoint, secondPoint);
      const nextZoom = clampZoom(gesture.startZoom * (getDistance(firstPoint, secondPoint) / gesture.startDistance));
      const localMidpoint = getLocalPoint(midpoint.x, midpoint.y);
      const nextPan = {
        x: localMidpoint.x - gesture.worldMidpoint.x * nextZoom,
        y: localMidpoint.y - gesture.worldMidpoint.y * nextZoom,
      };

      setZoom(nextZoom);
      setPan(nextPan);
    }
  };

  const handlePointerEndBackground = (event) => {
    activePointersRef.current.delete(event.pointerId);

    if (activePointersRef.current.size >= 2) {
      startPinchGesture();
      return;
    }

    if (activePointersRef.current.size === 1) {
      const [remainingPointer] = activePointersRef.current.values();
      startPanGesture(remainingPointer);
      return;
    }

    gestureRef.current = null;
  };

  const handlePointerDownBackground = (event) => {
    const isMousePanTrigger = event.pointerType === 'mouse'
      ? (event.button === 2 || event.button === 1 || event.button === 0) && isCanvasGestureTarget(event.target)
      : isCanvasGestureTarget(event.target);

    if (!isMousePanTrigger) {
      return;
    }

    if (typeof event.currentTarget.setPointerCapture === 'function') {
      try {
        event.currentTarget.setPointerCapture(event.pointerId);
      } catch {
        // Synthetic or unsupported pointer streams may not allow capture.
      }
    }
    activePointersRef.current.set(event.pointerId, {
      id: event.pointerId,
      x: event.clientX,
      y: event.clientY,
    });

    if (activePointersRef.current.size >= 2) {
      startPinchGesture();
      return;
    }

    startPanGesture({
      id: event.pointerId,
      x: event.clientX,
      y: event.clientY,
    });
  };

  const addNode = (typeKey) => {
    const definition = NODE_TYPES[typeKey];

    if (currentPoints < definition.cost) {
      return;
    }

    const rect = containerRef.current?.getBoundingClientRect();
    const centerX = rect ? rect.width / 2 : window.innerWidth / 2;
    const centerY = rect ? rect.height / 2 : window.innerHeight / 2;

    setNodes((previous) => [
      ...previous,
      {
        id: `node_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        type: typeKey,
        x: (centerX - panRef.current.x) / zoomRef.current - NODE_WIDTH / 2,
        y: (centerY - panRef.current.y) / zoomRef.current - 100,
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
    const pointerWorldPoint = getWorldPoint(event.clientX, event.clientY);
    const offsetX = pointerWorldPoint.x - node.x;
    const offsetY = pointerWorldPoint.y - node.y;

    const onPointerMove = (moveEvent) => {
      const nextWorldPoint = getWorldPoint(moveEvent.clientX, moveEvent.clientY);

      setNodes((previous) =>
        previous.map((item) =>
          item.id === nodeId ? { ...item, x: nextWorldPoint.x - offsetX, y: nextWorldPoint.y - offsetY } : item,
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

      const nextWorldPoint = getWorldPoint(moveEvent.clientX, moveEvent.clientY);
      setDrawingLine((previous) => ({
        ...previous,
        currentX: nextWorldPoint.x,
        currentY: nextWorldPoint.y,
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
        onPointerMove={handlePointerMoveBackground}
        onPointerUp={handlePointerEndBackground}
        onPointerCancel={handlePointerEndBackground}
        onContextMenu={(event) => event.preventDefault()}
        ref={containerRef}
        style={{ touchAction: 'none' }}
      >
        <div
          className="pointer-events-none absolute inset-0 bg-grid-dots"
          style={{
            backgroundSize: `${40 * zoom}px ${40 * zoom}px`,
            backgroundPosition: `${pan.x}px ${pan.y}px`,
            opacity: 0.3,
          }}
        />

        <div className="absolute inset-0 origin-top-left" style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})` }}>
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
                data-canvas-node="true"
                className="absolute z-10 flex flex-col rounded-lg border border-slate-700 bg-slate-800 text-slate-200 shadow-2xl transition-shadow hover:shadow-indigo-500/20"
                style={{ left: node.x, top: node.y, width: NODE_WIDTH }}
              >
                <div className={`flex items-center justify-between rounded-t-lg px-2.5 py-1.5 shadow-inner ${definition.color}`}>
                  <span className="truncate text-[11px] font-bold tracking-wide text-white drop-shadow-sm">{definition.name}</span>
                  <button
                    onClick={() => deleteNode(node.id)}
                    onPointerDown={(event) => event.stopPropagation()}
                    className="rounded p-1 text-white/60 transition-colors hover:bg-white/20 hover:text-white"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>

                <div className="relative min-h-[36px] py-1.5">
                  <div className="absolute bottom-0 left-0 top-1.5 flex flex-col gap-3">
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
                    <div className="flex justify-center px-3">
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
                        className="w-16 rounded border border-slate-600 bg-slate-900 px-2 py-1 text-center font-mono text-xs text-emerald-400 focus:border-indigo-500 focus:outline-none"
                        onPointerDown={(event) => event.stopPropagation()}
                      />
                    </div>
                  )}

                  <div className="absolute bottom-0 right-0 top-1.5 flex flex-col items-end gap-3">
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