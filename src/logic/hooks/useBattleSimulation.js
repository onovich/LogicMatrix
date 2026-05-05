import { useEffect, useMemo, useState } from 'react';
import { BATTLE_TICK_MS, createEnemyState, PLAYER_START } from '../../data/gameConfig';
import { stepBattle } from '../engine/battleEngine';
import { evaluateGraph } from '../engine/graph';

export function useBattleSimulation({ nodes, connections, level, onEnd }) {
  const [player, setPlayer] = useState(PLAYER_START);
  const [enemy, setEnemy] = useState(() => createEnemyState(level));
  const [tickCount, setTickCount] = useState(0);
  const [isOver, setIsOver] = useState(false);
  const [logs, setLogs] = useState(['战斗初始化...']);

  const evaluatePlayerAction = useMemo(() => {
    return (battleState) => evaluateGraph(nodes, connections, battleState);
  }, [nodes, connections]);

  useEffect(() => {
    setPlayer(PLAYER_START);
    setEnemy(createEnemyState(level));
    setTickCount(0);
    setIsOver(false);
    setLogs(['战斗初始化...']);
  }, [level, nodes, connections]);

  useEffect(() => {
    if (isOver) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setTickCount((value) => value + 1);

      setPlayer((currentPlayer) => {
        let nextPlayerSnapshot = currentPlayer;

        setEnemy((currentEnemy) => {
          const result = stepBattle({
            player: currentPlayer,
            enemy: currentEnemy,
            level,
            evaluatePlayerAction,
          });

          nextPlayerSnapshot = result.player;

          if (result.outcome === 'win') {
            setLogs((previous) => ['敌人已被摧毁，战斗胜利！', ...result.logs, ...previous].slice(0, 10));
            setIsOver(true);
            window.setTimeout(() => onEnd(true), 2000);
          } else if (result.outcome === 'lose') {
            setLogs((previous) => ['核心被摧毁，战斗失败！', ...result.logs, ...previous].slice(0, 10));
            setIsOver(true);
            window.setTimeout(() => onEnd(false), 2000);
          } else if (result.logs.length > 0) {
            setLogs((previous) => [...result.logs.slice().reverse(), ...previous].slice(0, 15));
          }

          return result.enemy;
        });

        return nextPlayerSnapshot;
      });
    }, BATTLE_TICK_MS);

    return () => window.clearInterval(timer);
  }, [evaluatePlayerAction, isOver, level, onEnd]);

  return {
    player,
    enemy,
    tickCount,
    logs,
  };
}