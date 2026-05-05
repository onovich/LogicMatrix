export const NODE_TYPES = {
  Distance: { id: 'Distance', name: '敌我距离', type: 'sensor', inputs: [], outputs: ['val'], cost: 10, color: 'bg-blue-600' },
  PlayerHP: { id: 'PlayerHP', name: '自身血量', type: 'sensor', inputs: [], outputs: ['val'], cost: 10, color: 'bg-blue-600' },
  EnemyHP: { id: 'EnemyHP', name: '敌人血量', type: 'sensor', inputs: [], outputs: ['val'], cost: 10, color: 'bg-blue-600' },
  Constant: { id: 'Constant', name: '常数', type: 'value', inputs: [], outputs: ['val'], cost: 5, color: 'bg-gray-600', hasInput: true },
  GreaterThan: { id: 'GreaterThan', name: '大于等于 (A>=B)', type: 'logic', inputs: ['A', 'B'], outputs: ['out'], cost: 10, color: 'bg-purple-600' },
  LessThan: { id: 'LessThan', name: '小于等于 (A<=B)', type: 'logic', inputs: ['A', 'B'], outputs: ['out'], cost: 10, color: 'bg-purple-600' },
  Equals: { id: 'Equals', name: '等于 (A=B)', type: 'logic', inputs: ['A', 'B'], outputs: ['out'], cost: 10, color: 'bg-purple-600' },
  And: { id: 'And', name: '且 (A&B)', type: 'logic', inputs: ['A', 'B'], outputs: ['out'], cost: 15, color: 'bg-indigo-600' },
  Or: { id: 'Or', name: '或 (A|B)', type: 'logic', inputs: ['A', 'B'], outputs: ['out'], cost: 15, color: 'bg-indigo-600' },
  ActionAttack: { id: 'ActionAttack', name: '执行: 攻击', type: 'action', inputs: ['Trigger'], outputs: [], cost: 20, color: 'bg-red-600' },
  ActionForward: { id: 'ActionForward', name: '执行: 前进', type: 'action', inputs: ['Trigger'], outputs: [], cost: 15, color: 'bg-emerald-600' },
  ActionBack: { id: 'ActionBack', name: '执行: 后退', type: 'action', inputs: ['Trigger'], outputs: [], cost: 15, color: 'bg-emerald-600' },
  ActionHeal: { id: 'ActionHeal', name: '执行: 治疗', type: 'action', inputs: ['Trigger'], outputs: [], cost: 25, color: 'bg-green-600' },
};

export const INITIAL_UNLOCKED = ['Distance', 'Constant', 'LessThan', 'ActionAttack', 'ActionForward'];
export const CONNECTION_COST = 5;
export const NODE_WIDTH = 160;
export const PORT_OFFSET_Y = 40;
export const PORT_SPACING = 28;
export const ARENA_SIZE = 12;