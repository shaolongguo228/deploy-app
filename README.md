# DeployMaster | 部署大师

<div align="center">

![Electron](https://img.shields.io/badge/Electron-30.0-47848F?logo=electron&logoColor=white)
![React](https://img.shields.io/badge/React-18.2-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.2-3178C6?logo=typescript&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green)

**A local-first, cross-platform desktop application for automating project deployments.**

**本地优先的跨平台桌面应用，用于自动化项目部署。**

[English](#english) | [中文](#中文)

</div>

---

## English

### ✨ Features

- **🔒 Local Storage**: All server credentials and project configs stored locally in JSON files. No external database required.
- **🖥️ Multi-Server Support**: Manage multiple server environments (Production, Staging, Development).
- **🚀 One-Click Deploy**: Automate the entire deployment flow:
  - Execute local pre-deploy commands
  - Build your project locally
  - Upload artifacts via SFTP
  - Run remote post-deploy commands
  - Auto-restart services
- **📋 Ordered Command Lists**: Add multiple pre/post-deploy commands with drag-to-reorder and enable/disable toggles.
- **📄 Live Logs**: Stream deployment output in real-time with color-coded log levels.
- **🔍 Log Viewing**: Execute remote log commands directly from the UI.
- **⚡ No-Upload Mode**: Skip build and upload for server-side code pulling workflows.
- **🌐 Bilingual UI**: Full English and Chinese language support.
- **🎨 Modern Design**: Dark/Light mode with glassmorphism UI.

### 📦 Supported Project Types

| Type | Description |
|------|-------------|
| **Java** | Upload JAR → Restart script |
| **Frontend** | Build → Upload dist → Nginx reload |
| **Python** | Upload source → Restart service |
| **Custom** | Fully customizable commands |

### 🛠️ Tech Stack

- **Framework**: Electron + Vite
- **Frontend**: React + TypeScript + TailwindCSS
- **State/Theme**: React Context + next-themes
- **I18n**: react-i18next
- **Backend**: Node.js, ssh2 (SSH/SFTP), fs-extra, iconv-lite

### 🚀 Getting Started

#### Prerequisites
- Node.js v18+

#### Installation

```bash
# Clone the repository
git clone <repository-url>
cd deploy-master/electron-app

# Install dependencies
npm install

# Start development
npm run dev
```

#### Building

```bash
# Create distributable installer
npm run build
```

### 📖 Usage

1. **Add Server**: Configure your server connection (host, port, SSH credentials).
2. **Add Project**: Set up deployment configuration:
   - Choose target server
   - Configure local and remote paths
   - Add pre-deploy commands (e.g., `npm install`)
   - Configure build command and artifact path
   - Add post-deploy commands (e.g., `unzip`, `restart service`)
   - Set log command for remote log viewing
3. **Deploy**: Click "Deploy" to start the automated deployment.
4. **View Logs**: Monitor deployment progress in real-time.

### 📁 Project Structure

```
electron-app/
├── electron/                 # Main Process
│   ├── main.ts              # Entry Point
│   ├── preload.ts           # Context Bridge
│   └── main/                # Backend Services
│       ├── storage.ts       # JSON File CRUD
│       └── deploy/          # Deployment Logic
│           ├── ssh.ts       # SSH/SFTP Wrapper
│           ├── local.ts     # Local Command Executor
│           └── orchestrator.ts
├── src/                     # Renderer Process (UI)
│   ├── components/          # UI Components
│   ├── pages/               # Page Views
│   ├── services/            # Frontend APIs
│   ├── i18n/                # Localization
│   └── types/               # TypeScript Interfaces
```

### 📄 License

MIT License - see [LICENSE](LICENSE) for details.

---

## 中文

### ✨ 功能特性

- **🔒 本地存储**：所有服务器凭据和项目配置都存储在本地JSON文件中，无需外部数据库。
- **🖥️ 多服务器支持**：管理多个服务器环境（生产、预发、开发）。
- **🚀 一键部署**：自动化整个部署流程：
  - 执行本地部署前命令
  - 本地构建项目
  - 通过SFTP上传构建产物
  - 执行远程部署后命令
  - 自动重启服务
- **📋 有序命令列表**：添加多个部署前/后命令，支持拖拽排序和启用/禁用切换。
- **📄 实时日志**：实时流式输出部署日志，支持颜色区分日志级别。
- **🔍 日志查看**：直接从界面执行远程日志查看命令。
- **⚡ 无上传模式**：跳过构建和上传，适用于服务器端拉取代码的工作流。
- **🌐 双语界面**：完整的中英文语言支持。
- **🎨 现代设计**：深色/浅色主题，玻璃拟态UI设计。

### 📦 支持的项目类型

| 类型 | 说明 |
|------|------|
| **Java** | 上传JAR → 重启脚本 |
| **前端** | 构建 → 上传dist → Nginx重载 |
| **Python** | 上传源码 → 重启服务 |
| **自定义** | 完全自定义命令 |

### 🛠️ 技术栈

- **框架**: Electron + Vite
- **前端**: React + TypeScript + TailwindCSS
- **状态/主题**: React Context + next-themes
- **国际化**: react-i18next
- **后端**: Node.js, ssh2 (SSH/SFTP), fs-extra, iconv-lite

### 🚀 快速开始

#### 环境要求
- Node.js v18+

#### 安装

```bash
# 克隆仓库
git clone <repository-url>
cd deploy-master/electron-app

# 安装依赖
npm install

# 启动开发模式
npm run dev
```

#### 打包

```bash
# 创建可分发安装程序
npm run build
```

### 📖 使用方法

1. **添加服务器**：配置服务器连接信息（主机、端口、SSH凭据）。
2. **添加项目**：设置部署配置：
   - 选择目标服务器
   - 配置本地和远程路径
   - 添加部署前命令（如 `npm install`）
   - 配置构建命令和产物路径
   - 添加部署后命令（如 `unzip`、`重启服务`）
   - 设置日志命令用于远程日志查看
3. **部署**：点击"部署"开始自动化部署。
4. **查看日志**：实时监控部署进度。

### 💡 高级功能

#### 无上传模式（服务器端拉取代码）

如果您的工作流是在服务器上直接拉取代码并构建，可以关闭"启用文件上传"选项：

1. 编辑项目配置
2. 取消勾选"启用文件上传"
3. 配置部署后命令（如 `git pull && npm install && npm run build`）

这样部署时将跳过本地构建和文件上传步骤。

#### 自动查看日志

勾选"部署完成后自动查看日志"选项，部署成功后会自动执行日志查看命令。

### 📁 项目结构

```
electron-app/
├── electron/                 # 主进程
│   ├── main.ts              # 入口文件
│   ├── preload.ts           # 上下文桥接
│   └── main/                # 后端服务
│       ├── storage.ts       # JSON文件读写
│       └── deploy/          # 部署逻辑
│           ├── ssh.ts       # SSH/SFTP封装
│           ├── local.ts     # 本地命令执行器
│           └── orchestrator.ts
├── src/                     # 渲染进程（UI）
│   ├── components/          # UI组件
│   ├── pages/               # 页面视图
│   ├── services/            # 前端API
│   ├── i18n/                # 国际化
│   └── types/               # TypeScript类型定义
```

### 🤝 贡献

欢迎提交 Pull Request 和 Issue！

### 📄 开源协议

MIT License - 详见 [LICENSE](LICENSE)

---

<div align="center">

**⭐ 如果这个项目对你有帮助，请给它一个Star！⭐**

</div>
