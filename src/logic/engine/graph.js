import { NODE_TYPES, NODE_WIDTH, PORT_OFFSET_Y, PORT_SPACING } from '../../data/nodeTypes';

export function getPortPos(node, portIndex, isOutput) {
  return {
    x: node.x + (isOutput ? NODE_WIDTH : 0),
    y: node.y + PORT_OFFSET_Y + portIndex * PORT_SPACING + 6,
  };
}

export function createBezierPath(startX, startY, endX, endY) {
  const controlPointOffset = Math.max(Math.abs(endX - startX) / 2, 50);
  return `M ${startX} ${startY} C ${startX + controlPointOffset} ${startY}, ${endX - controlPointOffset} ${endY}, ${endX} ${endY}`;
}

export function evaluateGraph(nodes, connections, battleState) {
  const actionNodes = nodes.filter((node) => NODE_TYPES[node.type].type === 'action');
  let chosenAction = null;
  let maxTriggerValue = -Infinity;

  const getInputValue = (targetNodeId, targetPortName, visited) => {
    if (visited.has(targetNodeId)) {
      return 0;
    }

    visited.add(targetNodeId);

    const connection = connections.find(
      (item) => item.toNode === targetNodeId && item.toPort === targetPortName,
    );

    if (!connection) {
      return 0;
    }

    const sourceNode = nodes.find((node) => node.id === connection.fromNode);

    if (!sourceNode) {
      return 0;
    }

    switch (sourceNode.type) {
      case 'Constant':
        return Number.parseFloat(sourceNode.value) || 0;
      case 'Distance':
        return Math.abs(battleState.player.pos - battleState.enemy.pos);
      case 'PlayerHP':
        return battleState.player.hp;
      case 'EnemyHP':
        return battleState.enemy.hp;
      case 'GreaterThan':
        return getInputValue(sourceNode.id, 'A', new Set(visited)) >= getInputValue(sourceNode.id, 'B', new Set(visited)) ? 1 : 0;
      case 'LessThan':
        return getInputValue(sourceNode.id, 'A', new Set(visited)) <= getInputValue(sourceNode.id, 'B', new Set(visited)) ? 1 : 0;
      case 'Equals':
        return getInputValue(sourceNode.id, 'A', new Set(visited)) === getInputValue(sourceNode.id, 'B', new Set(visited)) ? 1 : 0;
      case 'And':
        return getInputValue(sourceNode.id, 'A', new Set(visited)) > 0 && getInputValue(sourceNode.id, 'B', new Set(visited)) > 0 ? 1 : 0;
      case 'Or':
        return getInputValue(sourceNode.id, 'A', new Set(visited)) > 0 || getInputValue(sourceNode.id, 'B', new Set(visited)) > 0 ? 1 : 0;
      default:
        return 0;
    }
  };

  for (const actionNode of actionNodes) {
    const triggerValue = getInputValue(actionNode.id, 'Trigger', new Set());
    if (triggerValue > 0 && triggerValue > maxTriggerValue) {
      maxTriggerValue = triggerValue;
      chosenAction = actionNode.type;
    }
  }

  return chosenAction;
}