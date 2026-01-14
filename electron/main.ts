import { app, BrowserWindow, ipcMain } from 'electron'
// import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

// const require = createRequire(import.meta.url)
const __dirname = path.dirname(fileURLToPath(import.meta.url))

process.env.APP_ROOT = path.join(__dirname, '..')

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, 'public') : RENDERER_DIST

let win: BrowserWindow | null

function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, 'logo.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
    },
    // Hide the default menu
    autoHideMenuBar: true,
    width: 1400,
    height: 900
  })

  // Open DevTools in development
  // if (VITE_DEV_SERVER_URL) {
  //   win.webContents.openDevTools()
  // }

  // Log any load errors
  win.webContents.on('did-fail-load', (_event, errorCode, errorDescription) => {
    console.error('Failed to load:', errorCode, errorDescription)
  })

  // Test active push message to Renderer-process.
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', (new Date).toLocaleString())
  })

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
  } else {
    win.loadFile(path.join(RENDERER_DIST, 'index.html'))
  }
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    win = null
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

app.whenReady().then(async () => {
  // Register Storage Handlers
  const { StorageService } = await import('./main/storage')
  new StorageService().registerHandlers()

  // Register Deployment Handlers
  const { DeploymentOrchestrator } = await import('./main/deploy/orchestrator')

  ipcMain.handle('deploy-project', async (event, args) => {
    const { project, server } = args;
    const win = BrowserWindow.fromWebContents(event.sender)
    if (win) {
      const orchestrator = new DeploymentOrchestrator(win)
      await orchestrator.deploy(project, server)
    }
  })

  ipcMain.handle('view-log', async (event, args) => {
    const { project, server } = args;
    const win = BrowserWindow.fromWebContents(event.sender)
    if (win) {
      const orchestrator = new DeploymentOrchestrator(win)
      await orchestrator.viewLog(project, server)
    }
  })

  createWindow()
})
