import {iconNames, $, $$, modalBox} from '../exports.web.js'

class wSocket {
    constructor(conf, exColas, printer, logger) {
        this.ip = conf.server.ip
        this.port = conf.server.port
        this.exColas = exColas
        this.printer = printer
        this.log = logger.std
        this.logError = logger.error

        this.printEvent = conf.touch? 'ontouchstart' : 'onmousedown'
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
                    this.log({origin: 'TURNOMATIC', event: 'SPREAD', message: `Colas: ${JSON.stringify(msg.colas)}, Turnos: ${JSON.stringify(msg.turnos)}, Tickets: ${JSON.stringify(msg.tickets)}`})
                break
                case 'update':
                    this.update(msg.cola, msg.numero)
                    this.log({origin: 'TURNOMATIC', event: 'UPDATE', message: `Cola: ${msg.cola}, Numero: ${msg.numero}`})
                break
                case 'updateTicket':
                    this.updateTicket(msg.cola, msg.numero)
                    this.log({origin: 'TURNOMATIC', event: 'UPDATETICKET', message: `Ticket: ${msg.cola}, Numero: ${msg.numero}`})
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
    }

    update(cola, num) {
        try         { var mainNum = $$(`#cola${cola}`) } catch(e){return}
        mainNum.innerHTML = `Atendido: <span>${num.toString()}</span>`
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
            this.logError({origin: 'TURNOMATIC', error: 'OFFLINE', message: `Conectando a ${this.ip}`})
        }, 5000)
      }
}

export default wSocket