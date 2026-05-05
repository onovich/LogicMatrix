import { ARENA_SIZE } from '../../data/nodeTypes';

export function enemyAI(state, level) {
  const distance = Math.abs(state.enemy.pos - state.player.pos);

  if (level >= 3 && state.enemy.hp < state.enemy.maxHp * 0.3 && distance < 3) {
    return 'ActionBack';
  }

  if (distance <= 1) {
    return 'ActionAttack';
  }

  return 'ActionForward';
}

export function stepBattle({ player, enemy, level, evaluatePlayerAction }) {
  const nextPlayer = { ...player, actionLog: '待命' };
  const nextEnemy = { ...enemy, actionLog: '待命' };
  const logs = [];

  const playerAction = evaluatePlayerAction({ player: nextPlayer, enemy: nextEnemy });
  const enemyAction = enemyAI({ player: nextPlayer, enemy: nextEnemy }, level);

  if (playerAction === 'ActionForward') {
    if (nextPlayer.pos < nextEnemy.pos - 1) {
      nextPlayer.pos += 1;
      nextPlayer.actionLog = '前进';
      logs.push('玩家 向前移动');
    }
  } else if (playerAction === 'ActionBack') {
    if (nextPlayer.pos > 0) {
      nextPlayer.pos -= 1;
      nextPlayer.actionLog = '后退';
      logs.push('玩家 向后退');
    }
  } else if (playerAction === 'ActionAttack') {
    nextPlayer.actionLog = '攻击!';
    if (Math.abs(nextPlayer.pos - nextEnemy.pos) <= 1) {
      const damage = 15;
      nextEnemy.hp -= damage;
      logs.push(`玩家 攻击! 造成 ${damage} 伤害`);
    } else {
      logs.push('玩家 攻击挥空...');
    }
  } else if (playerAction === 'ActionHeal') {
    nextPlayer.hp = Math.min(nextPlayer.maxHp, nextPlayer.hp + 10);
    nextPlayer.actionLog = '治疗';
    logs.push('玩家 使用治疗模块，恢复 10 HP');
  } else {
    logs.push('玩家 逻辑矩阵未输出有效动作');
  }

  if (nextEnemy.hp <= 0) {
    return {
      player: nextPlayer,
      enemy: nextEnemy,
      logs,
      outcome: 'win',
    };
  }

  if (enemyAction === 'ActionForward') {
    if (nextEnemy.pos > nextPlayer.pos + 1) {
      nextEnemy.pos -= 1;
      nextEnemy.actionLog = '前进';
      logs.push('敌人 逼近');
    }
  } else if (enemyAction === 'ActionBack') {
    if (nextEnemy.pos < ARENA_SIZE - 1) {
      nextEnemy.pos += 1;
      nextEnemy.actionLog = '后退';
      logs.push('敌人 后退');
    }
  } else if (enemyAction === 'ActionAttack') {
    nextEnemy.actionLog = '攻击!';
    if (Math.abs(nextPlayer.pos - nextEnemy.pos) <= 1) {
      const damage = 10 + Math.floor(level * 2);
      nextPlayer.hp -= damage;
      logs.push(`敌人 攻击! 造成 ${damage} 伤害`);
    } else {
      logs.push('敌人 攻击挥空...');
    }
  }

  if (nextPlayer.hp <= 0) {
    return {
      player: nextPlayer,
      enemy: nextEnemy,
      logs,
      outcome: 'lose',
    };
  }

  return {
    player: nextPlayer,
    enemy: nextEnemy,
    logs,
    outcome: 'ongoing',
  };
}