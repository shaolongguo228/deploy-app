# Desktop Auto-Deployment Tool - Project Documentation

## 1. Project Overview (Business Logic)

This is a **Desktop Auto-Deployment Tool** designed for developers to manage and deploy applications to remote servers directly from their local machine.

### Core Features
- **Server Management**: Add, edit, and delete server configurations (Host, Port, Auth).
- **Project Management**: Configure deployment plans for Java, Frontend, Python, or Custom projects.
- **Auto-Deployment**: One-click deployment including:
    1.  **Local Pre-processing**: Executing commands locally (e.g., `npm run build`, `mvn package`).
    2.  **Artifact Upload**: Uploading files via SFTP.
    3.  **Remote Execution**: Running start/restart commands on the server via SSH.
- **Real-time Logs**: Stream deployment logs directly to the UI.
- **Data Privacy**: All configuration data is stored **locally** in JSON files (`servers.json`, `projects.json`) within the user's data directory. No external database is required.

### Supported Project Types
1.  **Java (Jar)**: Upload jar -> Restart script.
2.  **Frontend**: Build -> Upload dist -> Nginx reload.
3.  **Python**: Upload source -> Restart service (Supervisor/Systemd).
4.  **Other**: Fully customizable commands.

---

## 2. Technical Architecture

### Tech Stack
- **Framework**: Electron + Vite
- **Frontend**: React + TypeScript + TailwindCSS
- **State/Theme**: React Context + `next-themes`
- **I18n**: `react-i18next`
- **Backend (Main Process)**: Node.js, `ssh2` (SSH/SFTP), `fs-extra` (File System), `child_process` (Local Exec).

### Directory Structure
```
electron-app/
├── electron/                 # Main Process
│   ├── main.ts               # Entry Point (Window creation, IPC registration)
│   ├── preload.ts            # Context Bridge (Exposes IPC to Renderer)
│   ├── types.ts              # Shared Type Definitions
│   └── main/                 # Backend Services
│       ├── storage.ts        # JSON File CRUD (fs-extra)
│       └── deploy/           # Deployment Logic
│           ├── ssh.ts        # SSH/SFTP Wrapper (ssh2)
│           ├── local.ts      # Local Command Executor
│           └── orchestrator.ts # Deployment Pipeline Manager
│
├── src/                      # Renderer Process (UI)
│   ├── components/           # UI Components (Header, Sidebar, etc.)
│   ├── pages/                # Page Views (Dashboard)
│   ├── services/             # Frontend APIs (Calls IPC)
│   │   ├── storage.ts        # Server/Project API
│   │   └── deploy.ts         # Deployment API
│   ├── i18n/                 # Localization (EN/CN)
│   ├── types/                # TypeScript Interfaces
│   ├── App.tsx               # Main Component
│   └── main.tsx              # React Entry Point
```

### Key Modules & Flows

#### 1. Data Storage
- **Main**: `StorageService` (`electron/main/storage.ts`) reads/writes to `app.getPath('userData')`.
- **IPC**: `get-servers`, `save-server`, `delete-server`, etc.
- **Renderer**: `storageService` (`src/services/storage.ts`) invokes these IPC channels.

#### 2. Deployment Execution
- **Main**: `DeploymentOrchestrator` (`electron/main/deploy/orchestrator.ts`) controls the flow.
    - Uses `LocalExecutor` to run local build commands.
    - Uses `SSHService` to connect, upload, and run remote commands.
    - Emits `deploy-log` events via `win.webContents.send`.
- **Renderer**: `deploymentService` triggers `deploy-project` and listens for `deploy-log`.

#### 3. Styling & Theming
- **TailwindCSS**: Configured in `tailwind.config.js`.
- **Theme**: `ThemeProvider` (`next-themes`) handles `class="dark"` toggling on `<html>`.

#### 4. Internationalization
- **Config**: `src/i18n/config.ts`.
- **Usage**: `useTranslation()` hook in components for dynamic text.

### Developer Setup
1.  Run `npm install`.
2.  Run `npm run dev` to start the app in development mode.
3.  Run `npm run build` to package the application.
