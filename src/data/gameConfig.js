export const INITIAL_GAME_STATE = 'build';
export const INITIAL_LEVEL = 1;
export const INITIAL_MAX_POINTS = 80;
export const BATTLE_TICK_MS = 800;
export const PLAYER_START = { hp: 100, maxHp: 100, pos: 2, actionLog: '部署就绪' };

export function createEnemyState(level) {
  const hp = 50 + level * 20;

  return {
    hp,
    maxHp: hp,
    pos: 9,
    actionLog: '系统待命',
  };
}