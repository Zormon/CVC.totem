const fs = require("fs")

class Logger {
    // Crea archivos de log si no existen
    constructor(logsDir, appName='default') {
        this.logDir = logsDir
        this.appName= appName
        this.logsDisabled = false
        this.errorsDisabled = false
    }

    log(origin, event, message, rot=true) {
        if ( !fs.existsSync(`${this.logDir}${this.appName}.app.log`) ) {
            try { fs.writeFileSync(`${this.logDir}${this.appName}.app.log`, `# ${this.appName} APPLICATION LOG\n# TIME; ORIGIN; EVENT; MESSAGE`) } catch(e) { this.logsDisabled = true }
        }

        if (!this.logsDisabled) {
            let now = new Date()
            let line =  now.getHours().toString().padStart(2,'0') + ':' +
                        now.getMinutes().toString().padStart(2,'0') + ' ' +
                        now.getDate() + '/' + 
                        (now.getMonth()+1) + '/' + 
                        now.getFullYear() + ';' + 
                        origin.toUpperCase() + ';' + 
                        event.toUpperCase() + ';' + 
                        message;
            fs.appendFileSync(`${this.logDir}${this.appName}.app.log`, '\n' + line )
            if (rot) { this.rotate(4000000) } // ~4MB
        }
    }

    error(origin, error, message, rot=true) {
        if ( !fs.existsSync(`${this.logDir}${this.appName}.error.log`) ) {
            try { fs.writeFileSync(`${this.logDir}${this.appName}.error.log`, `# ${this.appName} ERROR LOG\n# TIME; ORIGIN; ERROR; MESSAGE`) } catch(e) { this.errorsDisabled = true }
        }

        if (!this.errorsDisabled) {
            let now = new Date()
            let line =  now.getHours().toString().padStart(2,'0') + ':' +
                        now.getMinutes().toString().padStart(2,'0') + ' ' +
                        now.getDate() + '/' + 
                        (now.getMonth()+1) + '/' + 
                        now.getFullYear() + ';' + 
                        origin.toUpperCase() + ';' + 
                        error.toUpperCase() + ';' + 
                        message;
            fs.appendFileSync(`${this.logDir}${this.appName}.error.log`, '\n' + line )
            if (rot) { this.rotate(1000000, 'error') } // ~1MB
        }
    }

    // Rota logs si el archivo supera el tamaño especificado
    rotate(maxSize, type='app') {
        const now = Date.now()

        try {
            var size = fs.statSync(`${this.logDir}${this.appName}.${type}.log`)['size']
        } catch(err) { this.error('LOGS', 'CANT_ROTATE', err); return }
        
        if (size > maxSize) {
            fs.copyFileSync(`${this.logDir}${this.appName}.${type}.log`, `${this.logDir}/${now}.${this.appName}.${type}.log`)
            fs.unlinkSync(`${this.logDir}${this.appName}.${type}.log`)
            this.log('LOGS', 'ROTATE', now.toString(), false)
        }
    }
}


module.exports = Logger