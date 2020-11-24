const fs = require("fs")

class Logger {
    // Crea archivos de log si no existen
    constructor(logsDir, appName='default') {
        this.logDir = logsDir
        this.appName= appName
        this.logsDisabled = false
        this.errorsDisabled = false
    }

    log(origin, event, message) {
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
        }
    }
}


module.exports = Logger