import {iconNames, $, $$, modalBox} from '../exports.web.js'

class wSocketTotem {
    constructor(server, content, UI, printer, ipc, options={pan:false, touch:false}) {
        this.ip = server.ip
        this.port = server.port
        this.content = content
        this.exColas = UI.exColas
        this.shellExec = ipc.sys.shellExec
        this.printer = printer
        this.log = ipc.logger.std
        this.logError = ipc.logger.error
        this.touch = (typeof options.touch != 'undefined')? options.touch : false
        this.pan = (typeof options.pan != 'undefined')? options.pan : false

        this.printEvent = options.touch? 'ontouchstart' : 'onmousedown'
    }

    init() {
        this.ws =  new WebSocket(`ws://${this.ip}:${this.port}`)
        var _this = this
        _this.check()

        this.ws.onmessage = (message) => {
            let msg = JSON.parse(message.data)
            switch (msg.accion) {
                case 'spread':
                    this.spread(msg.colas, msg.turnos, msg.tickets)
                    this.log({origin: 'NODESERVER', event: 'SPREAD', message: `Colas: ${JSON.stringify(msg.colas)}, Turnos: ${JSON.stringify(msg.turnos)}, Tickets: ${JSON.stringify(msg.tickets)}`})
                break
                case 'update':
                    this.update(msg.cola, msg.numero)
                    this.log({origin: 'NODESERVER', event: 'UPDATE_NUM', message: `Cola: ${msg.cola}, Numero: ${msg.numero}`})
                break
                case 'updateTicket':
                    this.updateTicket(msg.cola, msg.numero)
                    this.log({origin: 'NODESERVER', event: 'UPDATETICKET', message: `Ticket: ${msg.cola}, Numero: ${msg.numero}`})
                break
                case 'event':
                    if (msg.event.devices.length === 0 || msg.event.devices.indexOf(this.content.deviceID) != -1) { // Si el evento es para todo o este equipo
                        switch (msg.event.type) {
                            case 'pan':
                                if ( this.pan ) {
                                    this.content.eventMedia('../../files/avisoPan.mp4', 16, 1)
                                    this.log({origin: 'NODESERVER', event: 'PAN', message: `Aviso del pan`})
                                }
                            break
                            case 'media':
                                if ( this.content.eventMedia(`${this.content.dir}/files/${msg.event.data.file}`, msg.event.data.duration, msg.event.data.volume)  ) {
                                    this.log({origin: 'NODESERVER', event: 'MEDIA_EVENT', message: `Archivo: ${msg.event.data.file}, Duracion: ${msg.event.data.duration}`})
                                } else {
                                    this.logError({origin: 'NODESERVER', error: 'MEDIA_EVENT_CANT_PLAY', message: `Evento recibido pero no se pudo reproducir ${msg.event.data.file}`})
                                }
                            break
                            case 'shellExec':
                                this.shellExec(msg.event.cmd)
                                this.log({origin: 'NODESERVER', event: 'SHELLEXEC_EVENT', message: `Comando: ${msg.event.data.cmd}`})
                            break
                        }
                    }
                break
                default:
                    modalBox('socketError', false)
                    _this.check()
                break
            }
        }
    }

    close() {
        this.ws.close()
    }

    spread(colas, turnos, tickets) {
        let divTickets = $('tickets')
        while (divTickets.firstChild) { divTickets.removeChild(divTickets.firstChild) }

        document.body.className = document.body.className.split(' ').filter(c=>!c.startsWith('ncolas-')).join(" ").trim()

        let ncolas = 0
        for (let i=0; i < colas.length; i++) {
            if ( this.exColas.indexOf(i+1) == -1 ) { 
                ncolas++
                let ticket, nombre, tik, turno, icon
                // Tickets
                ticket = document.createElement('button'); ticket.id =  `ticket${i}`;
                ticket.style = `background:linear-gradient(to bottom, ${colas[i].color}, ${colas[i].color}AA); color:${colas[i].color};`
                ticket.dataset.id = i
                ticket[this.printEvent] = (e)=> { 
                    fetch(`http://${this.ip}:${this.port}/ticket/${i}`).then(resp => resp.text()).then( (data)=> {
                        this.printer.printTicket(colas[i].nombre, data)
                    })
                 }
                nombre = document.createElement('span'); nombre.className = 'nombre'; nombre.textContent = colas[i].nombre
                tik = document.createElement('span'); tik.className = 'num'; tik.textContent = tickets[i].num
                turno = document.createElement('span'); turno.className = 'turno'; turno.id =  `cola${i}`; turno.innerHTML = `Atendido: <span>${turnos[i].num}</span>`
                icon = document.createElement('i'); icon.className = `icon-${iconNames[colas[i].icon]}`
                ticket.appendChild(nombre); ticket.appendChild(tik); ticket.appendChild(turno)
                ticket.appendChild(icon);
                divTickets.appendChild(ticket)
            }
        }
        document.body.classList.add(`ncolas-${ncolas}`)
        console.log(ncolas)
    }

    update(cola, num) {
        try         { var mainNum = $$(`#cola${cola}`) } catch(e){return}
        mainNum.innerHTML = `<span>Atendido:</span> <span>${num.toString()}</span>`
    }

    updateTicket(cola, num) {
        try { var ticket = $$(`#ticket${cola} > .num`) } catch(e){return}
        ticket.textContent = num.toString()
    }

    check() {
        clearTimeout(document.wsTimeout)
      
        var _this = this
        document.wsTimeout = setTimeout( ()=> {
            _this.close()
            _this.init()
            _this.check()

            // Error Modal
            modalBox('socketError', 'msgBox', [['header','ERROR DE CONEXIÓN'],['texto', `Conectando a ${this.ip}`]], 'error' )
            this.logError({origin: 'NODESERVER', error: 'OFFLINE', message: `Conectando a ${this.ip}`})
        }, 5000)
      }
}

export {wSocketTotem as default}