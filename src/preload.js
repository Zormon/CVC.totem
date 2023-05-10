const { contextBridge, ipcRenderer } = require("electron")

contextBridge.exposeInMainWorld (
    "ipc", {
        get: {
            appConf: () => ipcRenderer.sendSync('getGlobal', 'appConf'),
            path: (dir) => ipcRenderer.sendSync('getPath', dir)
        },
        save: {
            appConf: (data, files=[]) => ipcRenderer.send('saveAppConf', data, files ),
        },
        dialog: {
            saveDir: (opts) => ipcRenderer.sendSync('saveDirDialog', opts),
        },
        logger: {
            std: (data) => ipcRenderer.send('log', data),
            error: (data) => ipcRenderer.send('logError', data)
        },
        win: {
            close: (win) => ipcRenderer.send('closeWindow', win)
        },
        sys: {
            shellExec: (cmd) => ipcRenderer.send('execShell', cmd)
        },
        printer: {
            printPreview: (page, width, height) => { ipcRenderer.send('printPreview', page, width, height) },
            printImg: (img) => { ipcRenderer.send('printImg', img) }
        }
    }
)