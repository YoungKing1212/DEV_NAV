# DevNav - 开发者导航与工具集

<p align="center">
  <img src="docs/images/logo.png" width="120" height="120" alt="DevNav Logo">
</p>

<p align="center">
  <img alt="Vue" src="https://img.shields.io/badge/Vue.js-3.4-green?logo=vue.js">
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5.3-blue?logo=typescript">
  <img alt="Tailwind" src="https://img.shields.io/badge/Tailwind-3.4-38bdf8?logo=tailwindcss">
  <img alt="License" src="https://img.shields.io/badge/License-MIT-yellow.svg">
</p>

## 项目简介

DevNav 是一个为开发者打造的导航与工具集合平台。集成了书签管理、代码工具箱等实用功能，旨在提升开发者的日常工作效率。

### 主要功能

- 📚 书签管理
  - Chrome 书签同步
  - 文件夹分类管理
  - 标签系统
  - 快速搜索
  - 导入导出功能

- 🛠️ 开发工具箱
  - 代码格式化
  - JSON 格式化
  - 图片压缩
  - PDF 工具
  - 二维码生成
  - 时间工具

## 快速开始

```bash
# 克隆项目
git clone https://github.com/YoungKing1212/DEV_NAV.git

# 进入项目目录
cd DEV_NAV

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

## 构建部署

```bash
# 构建前端应用
npm run build

# 构建 Chrome 扩展
npm run build:extension
```

## 技术栈

- [Vue 3](https://vuejs.org/) - 渐进式 JavaScript 框架
- [Vite](https://vitejs.dev/) - 下一代前端构建工具
- [TypeScript](https://www.typescriptlang.org/) - JavaScript 的超集
- [Tailwind CSS](https://tailwindcss.com/) - 实用优先的 CSS 框架
- [Pinia](https://pinia.vuejs.org/) - Vue 状态管理方案
- [Vue Router](https://router.vuejs.org/) - Vue.js 官方路由
- [Chrome Extension API](https://developer.chrome.com/docs/extensions/) - Chrome 扩展开发

## 项目结构

```
devnav/
├── extension/          # Chrome 扩展相关代码
├── public/            # 静态资源
├── src/
│   ├── assets/       # 项目资源文件
│   ├── components/   # 通用组件
│   ├── stores/       # Pinia 状态管理
│   ├── types/        # TypeScript 类型定义
│   ├── utils/        # 工具函数
│   └── views/        # 页面组件
└── docs/             # 项目文档
```

## 开发指南

### 环境要求
- Node.js >= 16
- npm >= 7

### Chrome 扩展开发

1. 构建扩展：
```bash
npm run build:extension
```

2. 在 Chrome 中加载扩展：
- 打开 `chrome://extensions/`
- 开启开发者模式
- 点击"加载已解压的扩展程序"
- 选择 `extension/dist` 目录

## 贡献指南

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 提交 Pull Request

## 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](LICENSE) 文件

---

<p align="center">Made with ❤️ by DevNav Team</p>
