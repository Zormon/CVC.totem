import Timer from './timer.class.js'
import {$, $$, urlExists} from '../exports.web.js'

class Content {
    constructor(dir, music, logger, {transition_duration=0, volume=0} = {}) {
        this.deviceID = -1
        this.media = null
        this.events = null
        this.dir = dir
        this.music = music
        this.current = null
        this.paused = false
        this.el = null
        this.startTimer
        this.log = logger.std
        this.logError = logger.error
        this.transitionDuration = transition_duration
        this.mediaVolume = volume


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
        if(!this.music.isFading && this.media != null && !this.paused) {
            this.startTimer = Date.now()
            if (this.media.length > 0) { // Hay contenidos
                this.showNoContents(false)
                try { // La primera vez no podrá hacer esto
                    this.contentTimer.clear()
                    this.fadeTimer.clear()
                    $('content').remove()
                } catch (e) {}
                
                let next = parseInt(localStorage.getItem('nextContent'))
                if ( isNaN(next) || next >= this.media.length) { next = 0 }
    
                this.current = this.media[next]
                if (this.music) {
                    if ( this.current.volume > 0 )  { this.music.fadeOut() }
                    else                            { this.music.fadeIn() }
                }
            
                switch ( this.current.file.split('.').pop().toUpperCase() ) {
                    case 'MP4': case 'MKV': case'WEBM':
                        this.el = document.createElement('video')
                        this.el.volume =  this.music? this.current.volume/10 * this.mediaVolume : 0
                        this.el.oncanplaythrough = ()=> { this.el.play() }
                    break
                    case 'JPG': case 'PNG': case 'WEBP': case 'AVIF':
                        this.el = document.createElement('img')
                }

                const barProgress = $$('#barProgress > div')
                barProgress.className = ''
                barProgress.offsetHeight
                barProgress.style.animationDuration = `${this.current.duration}s`
                barProgress.className = 'advance'
                
                this.contentTimer = new Timer( ()=> {_this.next()},  this.current.duration*1000 )
                this.fadeTimer = new Timer( ()=>{ 
                    this.el.className=''
                    void this.el.offsetWidth // Trigger Reflow for animation reset
                    this.el.className = `${this.current.transition} out` 
                } , ( this.current.duration - this.transitionDuration)*1000 )
                
                this.el.id = 'content'
                this.el.src = `file://${this.dir}/media/${this.current.file}`
                this.el.className = this.current.transition
                this.el.onerror = (e)=> { 
                    this.nextTimeout = setTimeout(()=> { _this.next() }, 1000) 
                    this.logError({origin: 'MEDIA', error: 'NOT_FOUND', message: `No se ha encontrado el archivo: ${this.current.file}`})
                }
                    
                $('media').appendChild(this.el)
                localStorage.setItem('nextContent', ++next)

                this.log({origin: 'MEDIA', event: 'NEXT', message: `name: ${this.current.name}, volume: ${this.current.volume}`})
            } else { // Si no encontro contenidos, vuelve a intentar a los 5sg
                this.showNoContents(true)
                this.logError({origin: 'MEDIA', error: 'NO_CONTENTS', message:  'No hay contenidos'})
                this.nextTimeout = setTimeout(()=> {_this.next()}, 5000) 
            }
        } else { // Lo vuelve a intentar a los dos segundos
            this.logError({origin: 'MEDIA', error: 'CANT_PLAY', message:  'La música estaba haciendo fading, no hay contenidos o estan pausados'})
            this.nextTimeout = setTimeout(()=> {_this.next()}, 2000) 
        }
    }

    showNoContents(visible) {
        $('media').classList.toggle('noContents', visible)
    }

    togglePause() {
        if (!this.paused) { // Pause
            $('barProgress').style.animationPlayState = 'paused'
            this.fadeTimer.pause()
            this.contentTimer.pause()
            if (this.el.nodeName == 'VIDEO') { this.el.pause() }

            this.log({origin: 'MEDIA', event: 'PAUSE', message: `name: ${this.current.name}`})
        } else { // Play
            $('barProgress').style.animationPlayState = 'running'
            this.fadeTimer.play()
            this.contentTimer.play()
            if (this.el.nodeName == 'VIDEO') { this.el.play() }
            this.log({origin: 'MEDIA', event: 'RESUME', message: `name: ${this.current.name}, volume: ${this.current.volume}`})
        }
        this.paused = !this.paused
    }

    async updatePlaylist() {
        return fetch(`file://${this.dir}/deploy.json`).then(r => r.json()).then((data) => {
            this.deviceID = data.info.id
            this.media = new Array()

            let today = new Date; 
            const timeNow = today.getHours().toString().padStart(2,'0') + ':' + today.getMinutes().toString().padStart(2,'0')
            today.setUTCHours(0,0,0,0)
            today = today.getTime()

            for (let id of data.media) {
                const cont = data.catalog.media[id]
                if (!!!cont) { continue }

                const dateFrom = !!cont.dateFrom? Date.parse( cont.dateFrom ) : 0
                const dateTo = !!cont.dateTo? Date.parse( cont.dateTo ) : 9999999999999
                const timeFrom = cont.timeFrom?? '00:00'
                const timeTo = cont.timeTo?? '99:99'

                if ( dateFrom <= today && dateTo >= today && timeFrom <= timeNow && timeTo >= timeNow) {
                    this.media.push(cont)
                }
            }

            this.events = data.events

            this.log({origin: 'MEDIA', event: 'UPDATE_PLAYLIST', message: `Equipo: ${data.info.device.name}, Contenidos: ${data.media.length}, Eventos: ${data.events.length}`,})
        })
    }

    /**
     * Genera un evento con un contenido, pausando el vídeo y mostrando el contenido
     */
     async eventMedia(file, duration, volume) {
        var _this = this
        if (!this.evtMedia && await urlExists(file)) { // Solo hace algo si no hay ya un evento en curso y existe el archivo
            this.evtMedia = document.createElement("video")
            this.evtMedia.id = 'eventMedia'; this.evtMedia.volume = this.music? volume/10 : 0
            this.evtMedia.src = file

            $('media').appendChild(this.evtMedia)
            this.togglePause()
            if (this.music && volume > 0 ) { this.music.fadeOut() }
            this.evtMedia.play()

            setTimeout( ()=> {
                _this.togglePause()
                if ( _this.music && volume > 0 && _this.current.volume == 0 ) { _this.music.fadeIn() }
                $('eventMedia').remove()
                _this.evtMedia = false
            }, duration*1000 )

            return true
        } else { return false }
        
    }
}

export default Content