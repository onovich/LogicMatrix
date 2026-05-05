# Logic Matrix 交接文档

## 当前状态

- 当前仓库已从 origin/ 下的单文件原型整理为 Vite 5 + React 18 + Tailwind CSS v3 工程。
- GitHub Pages 自动部署已接通，main 分支推送会触发 [../.github/workflows/deploy.yml](../.github/workflows/deploy.yml)。
- 当前构建命令为 npm run build，最近一次本地构建通过。
- 玩法主链路已可运行：构筑画布、进入战斗、战斗结算、胜利三选一、失败结算。
- 电脑端体验目前相对稳定，已经支持无限画布拖拽和滚轮缩放。
- 手机端已补上单指拖拽和双指缩放的手势入口修正，但还缺一次真机线上回归确认。

## 最近完成的关键改动

- 将战斗状态聚合为单一 battleState，修复 log 在变但血条、死亡态不同步的问题。
- 将血量钳制到 0，避免出现负血与未正常结算的异常显示。
- system log 区域改为可滚动，并在新日志进入时自动聚焦最新一条。
- 比较器语义已调整为 大于等于 / 小于等于，对应图求值逻辑同步修改。
- 构筑界面增加右上角放弃战斗按钮，放弃不发奖励并返回构筑。
- 节点尺寸、奖励卡尺寸和移动端布局已经过多轮收缩与重排。
- 无限画布已支持桌面端滚轮缩放与拖拽。
- 手机端画布手势入口已修复，不再要求触点必须命中最外层容器。

## 经验教训

1. 这类原型最容易出错的不是算法本身，而是状态同步边界。
React 下如果把战斗中的 player、enemy、logs、isOver 拆成多个互相依赖的状态，很容易出现 log 更新了但 UI 其余部分没跟上的问题。这里用单一 battleState 对象统一推进是更稳的做法。

2. 真实触屏设备的事件命中路径不能用桌面调试器想当然代替。
无限画布的移动端问题并不是缩放算法错误，而是 pointerdown 触发条件过严，只接受最外层容器命中；真机上用户大多数时候点到的是内部画布层。处理触摸交互时，应优先判断“是否点中了需要排除的交互元素”，而不是判断“是否正好点中背景根节点”。

3. 原型迭代阶段，比较器与初始解锁节点的设计权重会直接影响早期可玩性。
这里将大于/小于调整为大于等于/小于等于后，早期可用策略空间明显更合理，同时保留原 key 避免破坏既有状态与解锁链路，是比重命名节点更稳的做法。

4. 浏览器内无限画布需要同时按桌面和移动端两套输入模型设计。
桌面端需要非 passive 的 wheel 监听来可靠阻止默认滚动；移动端则要明确单指拖拽、双指缩放、节点拖拽、端口连线之间的优先级，不然很容易互相抢事件。

5. UI 紧凑化不是简单整体缩放。
胜利奖励卡和解锁节点面板前几轮的问题都不是“尺寸不够小”这么简单，而是信息层级和间距分布失衡。缩小卡片的同时，还需要同步压标题、标签、说明文字和容器宽度，才能在桌面与手机上都成立。

## 当前 TODO

1. 真机回归手机端无限画布。
重点确认线上环境下的单指拖拽、双指缩放、拖拽节点、创建连线是否互不干扰。

2. 补一轮移动端输入体验细修。
如果真机上仍有问题，优先检查 pointer capture、touch-action、节点层级命中与浏览器手势冲突，而不是先改缩放公式。

3. 给关键交互补最小验证面。
当前主要依赖手工体验回归。后续至少应补图求值与战斗步进的纯逻辑测试，降低后续改 UI 时引入玩法回归的风险。

4. 继续收敛构筑阶段的信息密度。
如果后续新增节点种类，NodePalette 与解锁弹层大概率还需要再做一次信息分组与滚动策略设计。

5. 明确后续产品方向。
当前工程已经具备继续扩玩法的基础，但如果目标是未来迁移 Unity，应尽量继续把规则留在 src/logic/engine 和 src/data，避免重新把逻辑塞回 React 组件。

## 交接建议

- 如果下一个阶段继续做玩法，请先从 [../src/App.jsx](../src/App.jsx)、[../src/logic/hooks/useBattleSimulation.js](../src/logic/hooks/useBattleSimulation.js)、[../src/logic/engine/graph.js](../src/logic/engine/graph.js) 读起，先把状态流和图求值边界看清。
- 如果下一个阶段继续做构筑体验，请从 [../src/view/screens/BuildScreen.jsx](../src/view/screens/BuildScreen.jsx) 入手。这里已经同时承载节点拖拽、连线、画布平移和缩放，是当前最复杂的交互面。
- 如果下一个阶段继续做战斗表现，请看 [../src/view/screens/BattleScreen.jsx](../src/view/screens/BattleScreen.jsx) 和 [../src/logic/engine/battleEngine.js](../src/logic/engine/battleEngine.js)。
- 每次交互改动后至少执行一次 npm run build；涉及移动端手势时，构建通过不等于体验正确，必须补真实浏览器或真机回归。
- 发布路径仍依赖 Vite base /LogicMatrix/ 与 GitHub Pages 设置，若线上资源路径异常，先检查 vite.config.js 和 Pages 工作流，而不是先怀疑业务代码。

## 常用命令

- npm install
- npm run dev
- npm run build

## 线上与部署

- 远端仓库：git@github.com:onovich/LogicMatrix.git
- GitHub Pages 默认路径：<https://onovich.github.io/LogicMatrix/>
- 当前账号级自定义域名可能会把访问落到 <http://blog.onovich.com/LogicMatrix/>。
