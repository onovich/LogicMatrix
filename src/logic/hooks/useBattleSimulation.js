import { useEffect, useMemo, useState } from 'react';
import { BATTLE_TICK_MS, createEnemyState, PLAYER_START } from '../../data/gameConfig';
import { stepBattle } from '../engine/battleEngine';
import { evaluateGraph } from '../engine/graph';

export function useBattleSimulation({ nodes, connections, level, onEnd }) {
  const [battleState, setBattleState] = useState(() => ({
    player: PLAYER_START,
    enemy: createEnemyState(level),
    tickCount: 0,
    isOver: false,
    logs: ['战斗初始化...'],
  }));

  const evaluatePlayerAction = useMemo(() => {
    return (battleState) => evaluateGraph(nodes, connections, battleState);
  }, [nodes, connections]);

  useEffect(() => {
    setBattleState({
      player: PLAYER_START,
      enemy: createEnemyState(level),
      tickCount: 0,
      isOver: false,
      logs: ['战斗初始化...'],
    });
  }, [level, nodes, connections]);

  useEffect(() => {
    if (battleState.isOver) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setBattleState((currentState) => {
        if (currentState.isOver) {
          return currentState;
        }

        const result = stepBattle({
          player: currentState.player,
          enemy: currentState.enemy,
          level,
          evaluatePlayerAction,
        });

        const nextLogs = result.outcome === 'win'
          ? [...currentState.logs, ...result.logs, '敌人已被摧毁，战斗胜利！'].slice(-15)
          : result.outcome === 'lose'
            ? [...currentState.logs, ...result.logs, '核心被摧毁，战斗失败！'].slice(-15)
            : result.logs.length > 0
              ? [...currentState.logs, ...result.logs].slice(-15)
              : currentState.logs;

        if (result.outcome === 'win') {
          window.setTimeout(() => onEnd(true), 2000);
        } else if (result.outcome === 'lose') {
          window.setTimeout(() => onEnd(false), 2000);
        }

        return {
          player: result.player,
          enemy: result.enemy,
          tickCount: currentState.tickCount + 1,
          isOver: result.outcome !== 'ongoing',
          logs: nextLogs,
        };
      });
    }, BATTLE_TICK_MS);

    return () => window.clearInterval(timer);
  }, [battleState.isOver, evaluatePlayerAction, level, onEnd]);

  return {
    player: battleState.player,
    enemy: battleState.enemy,
    tickCount: battleState.tickCount,
    logs: battleState.logs,
  };
}