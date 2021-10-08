const { contextBridge, ipcRenderer } = require("electron")

contextBridge.exposeInMainWorld (
    "ipc", {
        get: {
            appConf: () => ipcRenderer.sendSync('getGlobal', 'appConf'),
            interface: () => ipcRenderer.sendSync('getGlobal', 'interface'),
        },
        save: {
            appConf: (data) => ipcRenderer.send('saveAppConf', data ),
            interface: (data) => ipcRenderer.send('saveInterface', data ),
        },
        dialog: {
            saveDir: (opts) => ipcRenderer.sendSync('saveDirDialog', opts),
        },
        logger: {
            std: (data) => ipcRenderer.send('log', data),
            error: (data) => ipcRenderer.send('logError', data),
        },
        win: {
            close: (win) => ipcRenderer.send('closeWindow', win)
        },
        sys: {
            shellExec: (cmd) => ipcRenderer.send('execShell', cmd)
        },
        printer: {
            printPage: (page, width, height, dryrun) => { ipcRenderer.send('printPage', page, width, height, dryrun) }
        }
    }
)