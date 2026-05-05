🤖 《逻辑矩阵》 (Logic Matrix) - AI 项目交接文档

To: 继任 AI 开发者
From: 初始 AI 架构师
Context: 本文档旨在为接手本项目的 AI 提供全景式的系统架构、设计意图及开发规范指南，以便快速切入并进行后续迭代。

1. 游戏基础信息 (Game Overview)

游戏中文名: 逻辑矩阵

游戏英文名: Logic Matrix

核心玩法: 可视化节点编程 (Node-based Visual Scripting) + 自动战斗 (Auto-battler) + 肉鸽元素 (Roguelike Draft)

当前版本: v1.0 (单文件 MVP 版本)

2. 设计文档 (Design Document)

2.1 核心循环 (Core Loop)

构筑阶段 (Build Phase): 玩家在一个受积分（Points）限制的无限画布上，通过放置和连接传感器、逻辑门、动作节点来编写机甲的 AI 逻辑。

战斗阶段 (Battle Phase): 玩家配置好的逻辑树与敌方预设 AI 进行基于 Tick 的回合制自动战斗。

结算阶段 (Resolution): * 胜利：进入 Draft 阶段，进行三选一肉鸽抽卡，获取新节点并提升积分上限。

失败：获取少量残骸积分，返回构筑阶段重新调优。

2.2 经济系统 (Economy System)

资源: 积分 (Points)。

消耗: 放置节点消耗 5-25 积分不等，连线消耗固定 5 积分。

回收: 删除节点或连线可 100% 退还积分，鼓励反复试错。

2.3 节点图谱体系 (Node Ontology)

Sensor (传感器): 无输入，仅输出环境状态（如：敌我距离、血量）。

Value (数值常量): 无输入，输出固定常量（玩家可输入数字调节）。

Logic (逻辑门): 接收多路输入，进行布尔运算（>、<、=、AND、OR），输出 1 或 0。

Action (动作执行): 仅接收输入（Trigger），被激活时在 Battle Phase 执行对应指令（前进、后退、攻击、治疗）。

3. 开发文档 (Development Document)

3.1 技术栈 (Tech Stack)

核心框架: React 18+ (使用 Functional Components & Hooks)

样式方案: Tailwind CSS (纯实用类名，无外部 CSS 文件)

图标库: lucide-react (无缝嵌入 UI)

架构形态: 目前为纯前端单文件应用 (App.jsx)。

3.2 核心模块解析 (Core Modules)

状态机 (State Machine): gameState 控制 UI 流转 (build -> battle -> draft -> gameover)。

无限画布引擎 (Canvas Engine): * 基于 pan state 控制全局偏移。

连线使用 SVG <path> 渲染，采用三次方贝塞尔曲线 (createBezierPath) 保证视觉平滑。

节点位置使用绝对定位 (absolute) + 相对画布坐标系。

逻辑求值器 (Graph Evaluator - 核心算法): * 算法特征: 在每个 Battle Tick，从 Action 节点开始反向追溯 (Backward Tracing) 进行递归求值。

防环机制: 递归函数 getInputValue 维护了一个 visited Set 集合。如果检测到成环（A接B，B接A），直接阻断并返回 0，防止调用栈溢出。

战斗引擎 (Battle Engine):

基于 useEffect 和 setInterval 实现简单的 Tick-based 循环。

每 0.8s 为一个 Tick，计算玩家逻辑与敌人简易 AI 逻辑，更新 HP 和坐标，同步输出战斗日志 (logs)。

4. 启动方式 (Startup Instructions)

本项目目前被压缩在单一 App.jsx 文件中。推荐的本地或线上启动方式：

Vite/CRA 环境:

初始化 React 项目：npm create vite@latest logic-matrix -- --template react

安装依赖：npm install lucide-react tailwindcss

配置 Tailwind 后，将 App.jsx 的内容完全替换现有入口文件即可运行。

在线沙盒 (CodeSandbox / StackBlitz):

创建 React + Tailwind 模板。

覆盖 App.js/jsx。

添加依赖 lucide-react。

5. 后续扩展思路 (Future Expansion Ideas - To Next AI)

接手本项目的 AI 请重点关注以下技术债和扩展方向：

5.1 玩法深度扩展

状态与记忆节点 (Memory Nodes): 引入 Flip-Flop (触发器) 或 Variable (变量存取) 节点，使 AI 能具备“状态记忆”（例如：记录上回合是否受到伤害）。

更多数学运算 (Math Ops): 加减乘除节点，允许进行复杂的距离换算或伤害预估。

计时器节点 (Timer/Tick Count): 允许玩家编写“每隔 3 个 Tick 执行一次攻击”的逻辑。

5.2 系统架构重构 (Tech Debt)

拆分组件: 目前单文件超 600 行。需拆分为 Canvas.jsx, Node.jsx, BattleEngine.jsx, Draft.jsx。

性能优化: 当节点数超过 50 个时，SVG 连线和 React state 频繁更新可能掉帧。建议引入 Zustand 或 Context 管理节点状态，并使用局部重渲染 (Memoization) 优化画布。

保存与分享: 引入 LocalStorage 序列化 nodes 和 connections 数组；后续可对接后端实现字符串导出/导入 (Base64 Schema) 用于玩家间的 AI 分享。

5.3 模式扩展

异步 PvP (Asynchronous PvP): 玩家上传自己的防守 AI 图谱，其他玩家挑战。

Boss 战: 敌人不仅是预设的简单逻辑，而是可以看到其复杂的“明牌逻辑图”，玩家需要针对性地编写克制逻辑。

6. 美术约束 (Art Constraints)

本游戏遵循**“硬核科幻、终端极客” (Hardcore Sci-Fi, Terminal Geek)** 风格。任何新加入的 UI 或特效需严格遵守以下约束：

色彩规范 (Color Palette):

背景 (Background): slate-900 到 slate-950 的暗黑深渊色。

连线 (Connections): 默认灰色 (slate-400)，高亮时使用对应主题色，绝对禁止使用高饱和度的刺眼霓虹色作为常驻色。

节点类别识别色 (Node Semantics): 必须严格执行。

🔵 传感器 (Sensors): 蓝色系 (bg-blue-600)

🟣 逻辑运算 (Logic): 紫色/靛蓝色系 (bg-purple-600 / bg-indigo-600)

🔴/🟢 动作 (Actions): 红色代表攻击 (bg-red-600)，绿色代表移动/恢复 (bg-emerald-600)

⚪ 常量 (Constant): 灰色系 (bg-gray-600)

形状与排版 (Shapes & Typography):

统一使用 rounded-lg 或 rounded-md 的微圆角，避免过度圆滑的设计。

强调单色等宽字体 (Monospace) 的使用（如战斗日志、积分数字），营造代码面板氛围。

动画原则 (Animation Principles):

克制: 避免全屏乱飞的粒子特效。

反馈: 交互需有明确反馈，例如悬浮连线变红、节点拖拽阴影加深 (shadow-indigo-500/20)、受到攻击时的微小震屏或颜色闪烁。

以 CSS transition 和简易的 animate-pulse / animate-bounce 为主。

End of Handover Document. Good luck, next AI agent.