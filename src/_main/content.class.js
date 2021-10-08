import Timer from './timer.class.js'
import {$, $$, urlExists} from '../exports.web.js'

const FADE_DURATION = 0.25

class Content {
    constructor(dir, music, logger) {
        this.deviceID = -1
        this.contenidos = null
        this.events = null
        this.dir = dir
        this.music = music
        this.current = null
        this.paused = false
        this.el = null
        this.startTimer
        this.log = logger.std
        this.logError = logger.error


        this.nextTimeout
        this.contentTimer
        this.fadeTimer
        this.evtMedia = false

    }

    /**
     * Carga el proximo contenido a mostrar
     */
    async next() {
        await this.updatePlaylist()
        clearTimeout( this.nextTimeout )
        var _this = this
        if(!this.music.isFading && this.contenidos != null && !this.paused) {
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
                if (this.music) {
                    if ( this.current.volumen > 0 ) { this.music.fadeOut() }
                    else                            { this.music.fadeIn() }
                }
            
                switch ( this.current.fichero.split('.').pop()) {
                    case 'mp4': case 'mkv':
                        this.el = document.createElement('video')
                        this.el.volume =  this.music? this.current.volumen : 0
                        this.el.oncanplaythrough = ()=> { this.el.play() }
                    break
                    case 'jpg': case 'png':
                        this.el = document.createElement('img')
                }

                const barProgress = $$('#barProgress > div')
                barProgress.className = ''
                barProgress.offsetHeight
                barProgress.style.animationDuration = `${this.current.duracion}s`
                barProgress.className = 'advance'
               
                this.fadeTimer = new Timer( ()=>{ this.el.className = '' } , ( this.current.duracion - FADE_DURATION)*1000 )
                this.contentTimer = new Timer( ()=> {_this.next()},  this.current.duracion*1000 )
                
                this.el.id = 'content'
                this.el.src = `file://${this.dir}/files/${this.current.fichero}`
                this.el.onerror = (e)=> { 
                    this.nextTimeout = setTimeout(()=> { _this.next() }, 1000) 
                    this.logError({origin: 'MEDIA', error: 'NOT_FOUND', message: `No se ha encontrado el archivo: ${this.current.fichero}`})
                }
                    
                $('media').appendChild(this.el)
                setTimeout(()=>{this.el.className = 'visible'}, 15) // Aplica la clase con un pequeño delay porque sino no funciona la animacion
                localStorage.setItem('nextContent', ++next)

                this.log({origin: 'MEDIA', event: 'NEXT', message: `Nombre: ${this.current.nombre}, Volumen: ${this.current.volumen}`})
            } else { // Si no encontro contenidos, vuelve a intentar a los 5sg
                this.logError({origin: 'MEDIA', error: 'NO_CONTENTS', message:  'No hay contenidos'})
                this.nextTimeout = setTimeout(()=> {_this.next()}, 5000) 
            }
        } else { // Lo vuelve a intentar a los dos segundos
            this.logError({origin: 'MEDIA', error: 'CANT_PLAY', message:  'La música estaba haciendo fading, no hay contenidos o estan pausados'})
            this.nextTimeout = setTimeout(()=> {_this.next()}, 2000) 
        }
    }

    togglePause() {
        if (!this.paused) { // Pause
            $('barProgress').style.animationPlayState = 'paused'
            this.fadeTimer.pause()
            this.contentTimer.pause()
            if (this.el.nodeName == 'VIDEO') { this.el.pause() }

            this.log({origin: 'MEDIA', event: 'PAUSE', message: `Nombre: ${this.current.nombre}`})
        } else { // Play
            $('barProgress').style.animationPlayState = 'running'
            this.fadeTimer.play()
            this.contentTimer.play()
            if (this.el.nodeName == 'VIDEO') { this.el.play() }
            this.log({origin: 'MEDIA', event: 'RESUME', message: `Nombre: ${this.current.nombre}, Volumen: ${this.current.volumen}`})
        }
        this.paused = !this.paused
    }

    async updatePlaylist() {
        return fetch(`file://${this.dir}/list.json`).then(r => r.json()).then((data) => {
            this.deviceID = data.info.id
            this.contenidos = new Array()

            let now = new Date; now.setUTCHours(0,0,0,0); now = now.getTime()

            data.contenidos.forEach(cont => {
                const desde = Date.parse( cont.desde )
                const hasta = Date.parse( cont.hasta )

                if ( desde <= now && hasta >= now ) {
                    this.contenidos.push( {
                        'nombre': cont.nombre,
                        'fichero': cont.fichero,
                        'duracion': cont.duracion,
                        'volumen': cont.volumen
                    })
                }
            })

            
            this.events = data.events

            this.log({origin: 'MEDIA', event: 'UPDATE_PLAYLIST', message: `Equipo: ${data.info.equipo}, Contenidos: ${data.contenidos.length}, Eventos: ${data.events.length}`,})
        })
    }

    /**
     * Genera un evento con un contenido, pausando el vídeo y mostrando el contenido
     */
     async eventMedia(file, duration, volume) {
        var _this = this
        if (!this.evtMedia && await urlExists(file)) { // Solo hace algo si no hay ya un evento en curso y existe el archivo
            this.evtMedia = document.createElement("video")
            this.evtMedia.id = 'eventMedia'; this.evtMedia.volume = this.music? volume : 0
            this.evtMedia.src = file

            $('media').appendChild(this.evtMedia)
            this.togglePause()
            if (this.music && volume > 0 ) { this.music.fadeOut() }
            this.evtMedia.play()

            setTimeout( ()=> {
                _this.togglePause()
                if ( _this.music && volume > 0 && _this.current.volumen == 0 ) { _this.music.fadeIn() }
                $('eventMedia').remove()
                _this.evtMedia = false
            }, duration*1000 )

            return true
        } else { return false }
        
    }
}

export default Content