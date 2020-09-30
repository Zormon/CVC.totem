function $$(id)     { return document.querySelector(id)     }
function sleep(ms) { return new Promise(resolve=>setTimeout(resolve,ms));}

class Printer {
    constructor(ipPrinter, port, ipcR) {
        this.ip = ipPrinter
        this.port = port
        this.ipc = ipcR

        this.fetching = false
        this.url = `http://${this.ip}/cgi-bin/epos/service.cgi?devid=local_printer&timeout=3000`
        // Footer de impresion
        this.footer = document.createElement('img')
        this.footer.src = "../../files/printFooter.png"
    }

    init () {
        var _this = this
        setInterval(()=> { _this.check()}, 3000)
    }

    async printTicket(cola, numero) {
        modalBox('printing', 'print', `Imprimiendo ticket ${numero} para ${cola}`, 'Recoja su ticket debajo')
        this.ipc.send('log', {origin: 'PRINT', event: 'TICKET', message: `Imprimiendo ticket ${numero} de cola ${cola}`})
        
        let canvas = document.createElement('canvas'); canvas.className = 'ticket'
        let ctx = canvas.getContext("2d")
        canvas.width = 512; canvas.height = 280
        ctx.textAlign = "center"
        // Cola
        ctx.font = 'bold 32px Arial'; ctx.fillText(cola, 250, 40)
        // Numero
        ctx.font = 'bold 200px Arial'; ctx.fillText(numero, 250, 200)
        // footer
        ctx.drawImage(this.footer, 120, 230, 240, 38 )

        const raster = this.toMonoImage( ctx.getImageData(0,0,512,280) )
        
        let printData = '<?xml version="1.0" encoding="utf-8"?><s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/"><s:Body><epos-print xmlns="http://www.epson-pos.com/schemas/2011/03/epos-print">'
        printData += `<image width="512" height="280" color="color_1" mode="mono">${btoa(raster)}</image>`
        printData += '<cut type="feed" />'
        printData += '</epos-print></s:Body></s:Envelope>'

        //document.body.appendChild(canvas)
        navigator.sendBeacon(this.url, new Blob([printData], {type:'text/plain'}))
        
        await sleep(5000)
        modalBox('printing', false)
    }

    check() {
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
                            this.ipc.send('logError', {origin: 'PRINT', error: 'COVER_OPEN', message:  errorText})
                        break;
                        case 'EPTR_REC_EMPTY':
                            errorText = 'No hay papel'
                            this.ipc.send('logError', {origin: 'PRINT', error: 'REC_EMPTY', message:  errorText})
                        break;
                        default:
                            errorText = xml.getAttribute('code')
                            this.ipc.send('logError', {origin: 'PRINT', error: 'UNKNOWN', message:  errorText})
                        break;
                    }
                    modalBox('printError', 'error', 'ERROR DE IMPRESORA', errorText)
                }
            }).finally(()=>{ this.fetching = false })
        } else {
            modalBox('printError', 'error', 'ERROR DE IMPRESORA', 'La impresora no responde')
            this.ipc.send('logError', {origin: 'PRINT', error: 'OFFLINE', message: 'La impresora no responde'})
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