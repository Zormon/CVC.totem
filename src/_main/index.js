import wSocket from './wSocketTotem.class.js'
import Content from './content.class.js'
import Printer from './printer.class.js'
import {$} from '../exports.web.js'
const conf = window.ipc.get.appConf()
const ui = window.ipc.get.interface()



function time() {
  let date = new Date
  $('time').textContent = date.getHours().toString().padStart(2,'0') + ':' + date.getMinutes().toString().padStart(2,'0')
}


// Aplica CSS basado en la configuracion
if (!ui.info) { document.body.classList.add('noInfo') }
const css = new CSSStyleSheet()
css.insertRule(` :root { --main-color: ${ui.colors.main};  } `)
css.insertRule(` :root { --secondary-color: ${ui.colors.secondary}; } `)
switch (ui.type) {
  case 0: // Vertical
    // No implementado
  break
  case 1: // Horizontal
    css.insertRule(` body { grid-template-columns: ${ui.ticketAreaSize}% auto !important; } `)
  break
}
document.adoptedStyleSheets = [css]

var content = new Content(conf.contentDir, false, window.ipc.logger )
content.updatePlaylist().then( ()=> { content.next() })
setInterval(()=>{ content.updatePlaylist() }, 20000) // 20 seconds

var printer = new Printer(conf.printer, { printer: window.ipc.printer, logger: window.ipc.logger })
printer.init()

var ws = new wSocket(conf.server, content, ui, printer, window.ipc, {pan:true, touch: conf.touch} )
ws.init()

time()
setInterval(time, 5000)



// Atajos de teclado para testeo
window.onkeyup = (e)=> {
  switch (e.keyCode) {
    case 13: // Enter: Siguiente contenido
      content.next()
      window.ipc.logger.std({origin: 'USER', event: 'SKIP_CONTENT', message: ''})
    break
    case 80: // P: Pausa
      content.togglePause()
    break
  }
}