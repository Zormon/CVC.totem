class Printer {
    constructor(conf, ipc) {
        this.type = conf.type
        this.ip = conf.ip
        this.port = conf.port
        this.log = ipc.logger.std
        this.logError = ipc.logger.error
        this.printPage = ipc.printer.printPage
        this.disabled = conf.ticket.disabled
        this.width = conf.ticket.width

        this.fetching = false
        this.url = `http://${this.ip}/cgi-bin/epos/service.cgi?devid=local_printer&timeout=3000`
        // Footer de impresion
        this.footer = document.createElement('img')
        this.footer.src = "../../files/printFooter.png"
    }

    init () {
        var _this = this
        if (this.type == 0) { setInterval(()=> { _this.check()}, 3000) } //ePOS printer
    }

    async printTicket(cola, numero) {
        modalBox('printing', 'print', `Imprimiendo ticket ${numero} para ${cola}`, 'Recoja su ticket debajo')
        this.log({origin: 'PRINT', event: 'TICKET', message: `Imprimiendo ticket ${numero} de cola ${cola}`})
        
        let canvas = document.createElement('canvas'); canvas.className = 'ticket'
        let ctx = canvas.getContext("2d")
        canvas.width = 300; canvas.height = 240 + this.footer.height
        ctx.textAlign = "center"
        // Cola
        ctx.font = `bold 40px Arial`; ctx.fillText(cola, 150, 50)
        // Numero
        ctx.font = `bold 200px Arial` ; ctx.fillText(numero, 150, 220)
        // footer
        ctx.drawImage( this.footer, 40, 250 )
        const imageData = ctx.getImageData(0,0,canvas.width,canvas.height)

        switch (this.type) {
            case 0: //ePOS printer
                const raster = this.toMonoImage( imageData )
                let printData = '<?xml version="1.0" encoding="utf-8"?><s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/"><s:Body><epos-print xmlns="http://www.epson-pos.com/schemas/2011/03/epos-print">'
                printData += `<image width="${canvas.width}" height="${canvas.height}" color="color_1" mode="mono">${btoa(raster)}</image>`
                printData += '<cut type="feed" />'
                printData += '</epos-print></s:Body></s:Envelope>'
                if (!this.disabled) { navigator.sendBeacon(this.url, new Blob([printData], {type:'text/plain'})) }
            break
            case 1: // Usb
                let printPage = '<!DOCTYPE html><html><head><title></title>'
                printPage += `<style>body, html { margin:0; padding:0; }</style>`
                printPage += '</head><body>'
                printPage += `<img width="${this.width}" src="${canvas.toDataURL("image/png")}">`
                printPage += '</body></html>'
                this.printPage(printPage)
            break
        }
        
        await sleep(5000)
        modalBox('printing', false)
    }

    check() { //ePOS check
        if (!this.fetching) {
            this.fetching = true
            const data = {
                headers: {'Content-Type': 'text/xml'}, method: 'POST',
                body: '<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/"><s:Body><epos-print xmlns="http://www.epson-pos.com/schemas/2011/03/epos-print"></epos-print></s:Body></s:Envelope>'
            }
            
            fetch(this.url, data).then(r=>r.text())
            .then(s=>new window.DOMParser().parseFromString(s,"text/xml"))
            .then(resp=>{
                let xml = resp.getElementsByTagName('response')[0]
                if (xml.getAttribute('success')=='true') { // No fallo
                    modalBox('printError', false)
                } else { // Fallo
                    let errorText
                    switch (xml.getAttribute('code')) {
                        case 'EPTR_COVER_OPEN':
                            errorText = 'Tapa abierta'
                            this.logError({origin: 'PRINT', error: 'COVER_OPEN', message:  errorText})
                        break;
                        case 'EPTR_REC_EMPTY':
                            errorText = 'No hay papel'
                            this.logError({origin: 'PRINT', error: 'REC_EMPTY', message:  errorText})
                        break;
                        default:
                            errorText = xml.getAttribute('code')
                            this.logError({origin: 'PRINT', error: 'UNKNOWN', message:  errorText})
                        break;
                    }
                    modalBox('printError', 'error', 'ERROR DE IMPRESORA', errorText)
                }
            }).catch((e)=> {
                modalBox('printError', 'error', 'ERROR DE RED', 'No se puede acceder a la red')
                this.logError({origin: 'NETWORK', error: 'NETWORK_UNREACHABLE', message: e.message})
             })
            .finally(()=>{ this.fetching = false })
        } else {
            modalBox('printError', 'error', 'ERROR DE IMPRESORA', 'La impresora no responde')
            this.logError({origin: 'PRINT', error: 'OFFLINE', message: `${this.ip}:${this.port}`})
        }
      }

      
    toMonoImage(imgdata) {
        let m8 = [
            [2, 130, 34, 162, 10, 138, 42, 170],
            [194, 66, 226, 98, 202, 74, 234, 106],
            [50, 178, 18, 146, 58, 186, 26, 154],
            [242, 114, 210, 82, 250, 122, 218, 90],
            [14, 142, 46, 174, 6, 134, 38, 166],
            [206, 78, 238, 110, 198, 70, 230, 102],
            [62, 190, 30, 158, 54, 182, 22, 150],
            [254, 126, 222, 94, 246, 118, 214, 86]
        ]
        const d = imgdata.data, w = imgdata.width, h = imgdata.height
        let r = new Array((w + 7 >> 3) * h), n=0, p=0, q=0, t, b, v, i, j
        for (j = 0; j < h; j++) {
            i = 0
            while (i < w) {
                b = i & 7
                t = m8[j & 7][b]
                v = Math.pow(((d[p++] * 0.29891 + d[p++] * 0.58661 + d[p++] * 0.11448) * d[p] / 255 + 255 - d[p++]) / 255, 1) * 255 | 0
                if (v < t) { n |= 128 >> b }
                i++
                if (b == 7 || i == w) {
                    r[q++] = String.fromCharCode(n == 16 ? 32 : n)
                    n = 0
                }
            }
        }
        return r.join('')
    }
}