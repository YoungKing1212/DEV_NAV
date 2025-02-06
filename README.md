# DevNav - 开发者导航与工具集

<p align="center">
  <img src="docs/images/logo.png" width="200" height="200" alt="DevNav Logo">
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

## 更新记录

### [1.0.1] - 2024-02-06

#### 改进
- 改进书签文件夹管理功能
  - 优化文件夹书签显示，同时匹配 folderId 和 tag
  - 更新书签分类逻辑，支持基于标签的文件夹匹配
  - 修改未分类书签筛选逻辑
- 优化构建流程
  - 修改 Dockerfile 构建配置
  - 分离 TypeScript 类型检查和构建步骤

#### 修复
- 修复书签导入时的类型错误
- 修复文件夹视图中的书签显示问题
- 修复标签过滤功能

### [1.0.0] - 2024-02-05

#### 新功能
- 基础书签管理功能
  - 添加、编辑、删除书签
  - 文件夹组织
  - 标签管理
- Chrome 扩展集成
  - 支持从 Chrome 导入书签
  - 自动同步功能
- 数据导入导出
  - 支持导入 HTML 格式书签文件
  - 支持导出书签数据

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

### 本地开发

```bash
# 构建前端应用
npm run build

# 构建 Chrome 扩展
npm run build:extension
```

### Docker 部署

项目提供了完整的 Docker 部署支持，包括多阶段构建和 Nginx 配置。

#### 方式一：使用 Docker

```bash
# 构建镜像
docker build -t devnav .

# 运行容器
docker run -d -p 80:80 --name devnav devnav

# 查看容器状态
docker ps
```

#### 方式二：使用 Docker Compose

```bash
# 启动服务
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

#### 部署文件说明

```
devnav/
├── Dockerfile          # Docker 构建文件
├── docker-compose.yml  # Docker Compose 配置
├── nginx.conf         # Nginx 配置文件
└── .dockerignore      # Docker 忽略文件
```

#### 注意事项

- 确保 80 端口未被占用
- 生产环境部署时建议配置 HTTPS
- 可以通过修改 nginx.conf 自定义服务器配置
- 推荐使用 Docker Compose 进行部署管理

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
