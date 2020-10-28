
const FADE_DURATION = 0.25

class Content {
    constructor(dir, ipcR) {
        this.contenidos = null
        this.dir = dir
        this.current = null
        this.paused = false
        this.el = null
        this.startTimer
        this.ipc = ipcR
        this.nextTimeout
        this.contentTimer
        this.fadeTimer
    }

    /**
     * Carga el proximo contenido a mostrar
     */
    next() {
        clearTimeout( this.nextTimeout )
        var _this = this
        if(this.contenidos != null && !this.paused) {
            this.startTimer = Date.now()
            if (this.contenidos.length > 0) { // Hay contenidos
                try { // La primera vez no podrá hacer esto
                    this.contentTimer.clear()
                    this.fadeTimer.clear()
                    $('content').remove()
                } catch (e) {}
                
                let next = parseInt(localStorage.getItem('nextContent'))
                if ( isNaN(next) || next >= this.contenidos.length) { next = 0 }
    
                this.current = this.contenidos[next]
                switch ( this.current.fichero.split('.').pop()) {
                    case 'mp4':
                        this.el = document.createElement('video')
                        this.el.volume =  0
                        this.el.oncanplaythrough = ()=> { this.el.play() }
                    break
                    case 'jpg':
                        this.el = document.createElement('img')
                }
               
                this.fadeTimer = new Timer( ()=>{ this.el.className = '' } , ( this.current.duracion - FADE_DURATION)*1000 )
                this.contentTimer = new Timer( ()=> {_this.next()},  this.current.duracion*1000 )
                
                this.el.id = 'content'
                this.el.src = `file://${this.dir}/files/${this.current.fichero}`
                this.el.onerror = (e)=> { 
                    this.nextTimeout = setTimeout(()=> { _this.next() }, 2000) 
                    this.ipc.send('logError', {origin: 'MEDIA', error: 'NOT_FOUND', message: `No se ha encontrado el archivo: ${this.current.fichero}`})
                }
                    
                $('media').appendChild(this.el)
                setTimeout(()=>{this.el.className = 'visible'}, 15) // Aplica la clase con un pequeño delay porque sino no funciona la animacion
                localStorage.setItem('nextContent', ++next)

                this.ipc.send('log', {origin: 'MEDIA', event: 'NEXT', message: `Nombre: ${this.current.nombre}`})
            } else { // Si no encontro contenidos, vuelve a intentar a los 5sg
                this.ipc.send('logError', {origin: 'MEDIA', error: 'NO_CONTENTS', message:  'No hay contenidos'})
                this.nextTimeout = setTimeout(()=> {_this.next()}, 5000) 
            }
        } else { // Lo vuelve a intentar a los dos segundos
            this.ipc.send('logError', {origin: 'MEDIA', error: 'CANT_PLAY', message:  'La música estaba haciendo fading, no hay contenidos o estan pausados'})
            this.nextTimeout = setTimeout(()=> {_this.next()}, 2000) 
        }
    }

    togglePause() {
        if (!this.paused) { // Pause
            this.fadeTimer.pause()
            this.contentTimer.pause()
            if (this.el.nodeName == 'VIDEO') { this.el.pause() }

            this.ipc.send('log', {origin: 'MEDIA', event: 'PAUSE', message: `Nombre: ${this.current.nombre}`})
        } else { // Play
            this.fadeTimer.play()
            this.contentTimer.play()
            if (this.el.nodeName == 'VIDEO') { this.el.play() }
            this.ipc.send('log', {origin: 'MEDIA', event: 'RESUME', message: `Nombre: ${this.current.nombre}`})
        }
        this.paused = !this.paused
    }

    async updatePlaylist() {
        return fetch(`file://${this.dir}/lista.xml`).then(r => r.text()).then(s => new window.DOMParser().parseFromString(s, "text/xml")).then((xml) => {
            let nodes = xml.getElementsByTagName('contenido')
            let equipo = xml.getElementsByTagName('contenidos')[0].getAttribute('equipo')
            this.contenidos = new Array()
            let now = new Date; now.setUTCHours(0,0,0,0); now = now.getTime()

            for (let i=0; i< nodes.length; i++) {
                const desde = Date.parse( nodes[i].getElementsByTagName('desde')[0].textContent )
                const hasta = Date.parse( nodes[i].getElementsByTagName('hasta')[0].textContent )

                if ( desde <= now && hasta >= now ) {
                    this.contenidos.push( {
                        'nombre': nodes[i].getElementsByTagName('nombre')[0].textContent,
                        'fichero': nodes[i].getElementsByTagName('fichero')[0].textContent,
                        'duracion': nodes[i].getAttribute('duracion')
                    })
                }
            }

            this.ipc.send('log', {origin: 'MEDIA', event: 'UPDATE_PLAYLIST', message: `Equipo: ${equipo}, Contenidos: ${nodes.length}`})
        })
      }
}