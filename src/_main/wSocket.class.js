function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)) }
function $$(id)     { return document.querySelector(id)     }
function isFunction(f) {return f && {}.toString.call(f)==='[object Function]'}

class wSocket {
    constructor(ip, port, ui, printer, ipcR) {
        this.ip = ip
        this.port = port
        this.ui = ui
        this.printer = printer
        this.ipc = ipcR
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
                    this.ipc.send('log', {origin: 'TURNOMATIC', event: 'SPREAD', message: `Colas: ${JSON.stringify(msg.colas)}, Turnos: ${JSON.stringify(msg.turnos)}, Tickets: ${JSON.stringify(msg.tickets)}`})
                break
                case 'update':
                    this.update(msg.cola, msg.numero)
                    this.ipc.send('log', {origin: 'TURNOMATIC', event: 'UPDATE', message: `Cola: ${msg.cola}, Numero: ${msg.numero}`})
                break
                case 'updateTicket':
                    this.updateTicket(msg.cola, msg.numero)
                    this.ipc.send('log', {origin: 'TURNOMATIC', event: 'UPDATETICKET', message: `Ticket: ${msg.cola}, Numero: ${msg.numero}`})
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
            if ( this.ui.exColas.indexOf(i+1) == -1 ) { 
                ncolas++
                // Tickets
                let ticket = document.createElement('div'); ticket.id =  `ticket${i}`;
                ticket.style = `background:linear-gradient(to bottom, ${colas[i].color}, ${colas[i].color}AA); color:${colas[i].color};`
                ticket.dataset.id = i
                ticket.onclick = ()=> {
                    fetch(`http://${this.ip}:${this.port}/ticket/${i}`).then(resp => resp.text()).then( (data)=> {
                        this.printer.printTicket(colas[i].nombre, data)
                    })
                }
                let nombre = document.createElement('span'); nombre.className = 'nombre'; nombre.textContent = colas[i].nombre
                let tik = document.createElement('span'); tik.className = 'num'; tik.textContent = tickets[i].num
                let turno = document.createElement('span'); turno.className = 'turno'; turno.id =  `cola${i}`; turno.textContent = turnos[i].num
                ticket.appendChild(nombre); ticket.appendChild(tik); ticket.appendChild(turno)
                divTickets.appendChild(ticket)
            }
        }
        document.body.classList.add(`ncolas-${ncolas}`)
    }

    update(cola, num) {
        try         { var mainNum = $$(`#cola${cola}`) } catch(e){return}
        mainNum.textContent = num.toString()
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
            modalBox('socketError', 'error', 'ERROR DE CONEXIÓN', `Conectando a ${remote.getGlobal('appConf').server.ip}`)
            this.ipc.send('logError', {origin: 'TURNOMATIC', error: 'OFFLINE', message: `Conectando a ${remote.getGlobal('appConf').server.ip}`})
        }, 5000)
      }
}