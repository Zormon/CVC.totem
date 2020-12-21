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
        printer: {
            printPage: (page) => { ipcRenderer.send('printPage', page) }
        }
    }
)