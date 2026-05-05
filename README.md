# Logic Matrix
Node-based mech AI drafting prototype built from a Gemini-style single-file concept into a runnable Vite + React project.<br/>**一个从 Gemini 风格单文件概念原型整理为可运行 Vite + React 工程的节点式机甲 AI 构筑游戏原型。**

## Overview
Logic Matrix mixes node-based visual scripting, auto-battler combat, and roguelike drafting in a hardcore sci-fi terminal presentation.<br/>**Logic Matrix 将节点式可视化编程、自动战斗与肉鸽抽卡结合在一起，并采用硬核科幻终端风格呈现。**
The current repository preserves the original prototype under origin/ and establishes a migration-ready architecture for future expansion or Unity porting rather than claiming a full gameplay-scale refactor is finished.<br/>**当前仓库保留了 origin/ 下的原始原型，同时建立了面向后续扩展和 Unity 迁移的架构基础，而不是夸大为完整的大规模玩法重构已结束。**

## Features
- Programmable node canvas with sensors, logic gates, constants, and action nodes.<br/>**可在画布上组合传感器、逻辑门、常量与动作节点的可编程节点系统。**
- Tick-based battle simulation that evaluates the player graph against an enemy AI.<br/>**按 Tick 推进的战斗模拟，会将玩家逻辑图与敌方 AI 进行对抗演算。**
- Draft rewards that unlock new node types and raise the point budget between encounters.<br/>**战斗胜利后可进行节点草拟解锁，并提升点数上限。**
- Separated data, engine, hooks, and view layers prepared for future non-React runtime reuse.<br/>**已拆出 data、engine、hooks、view 层，为未来脱离 React 复用逻辑做好准备。**

## Architecture
- src/data stores node definitions, configuration values, and battle constants.<br/>**src/data 用于存放节点定义、配置参数与战斗常量。**
- src/logic/engine contains graph evaluation, port geometry, and battle step rules that are portable to Unity-side systems later.<br/>**src/logic/engine 包含图求值、端口几何计算与战斗步进规则，后续可迁移到 Unity 侧系统。**
- src/logic/hooks bridges React lifecycle with the headless battle engine.<br/>**src/logic/hooks 负责把 React 生命周期与无头战斗引擎连接起来。**
- src/view/screens and src/view/components keep the UI assembly separated from rule computation.<br/>**src/view/screens 与 src/view/components 将界面组装与规则计算分离。**

## Project Layout
- origin/App.jsx keeps the original single-file source snapshot for reference and rollback.<br/>**origin/App.jsx 保留原始单文件源码快照，便于参考与回退。**
- src/App.jsx is now a thin composition root for game-state switching.<br/>**src/App.jsx 现在是负责状态切换的轻量组装入口。**
- .github/workflows/deploy.yml publishes the built site to GitHub Pages on pushes to main.<br/>**.github/workflows/deploy.yml 会在推送到 main 时自动发布到 GitHub Pages。**

## Development
- Install dependencies with npm install.<br/>**使用 npm install 安装依赖。**
- Start the local development server with npm run dev.<br/>**使用 npm run dev 启动本地开发服务器。**
- Create a production build with npm run build.<br/>**使用 npm run build 生成生产构建。**

## Deployment
- GitHub Pages deployment is handled by GitHub Actions using the repository base path /LogicMatrix/.<br/>**GitHub Pages 通过 GitHub Actions 自动部署，并已使用仓库子路径 /LogicMatrix/ 作为打包基座。**
- After pushing to main, open the Pages site at https://onovich.github.io/LogicMatrix/.<br/>**推送到 main 后，可通过 https://onovich.github.io/LogicMatrix/ 访问线上页面。**
- In repository settings, set Pages Source to GitHub Actions if it is not already selected.<br/>**如果仓库设置里尚未切换，请将 Pages Source 设为 GitHub Actions。**