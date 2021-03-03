import wSocket from './wSocket.class.js'
import Content from './content.class.js'
import Printer from './printer.class.js'
import {$} from '../exports.web.js'

const conf = window.ipc.get.appConf()
const ui = window.ipc.get.interface()

/*=============================================
=            Funciones            =
=============================================*/

/**
 * Actualiza la hora basada en el sistema y la pinta en su contenedor
 */
function time() {
  let date = new Date
  $('time').textContent = date.getHours().toString().padStart(2,'0') + ':' + date.getMinutes().toString().padStart(2,'0')
}

/*=====  End of Funciones  ======*/


/*=============================================
=            MAIN            =
=============================================*/

// Aplica CSS basado en la configuracion
if (!ui.info) { document.body.classList.add('noInfo') }
// Aplica estilos basados en la configuracion
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

var content = new Content(conf.contentDir, window.ipc.logger )
content.updatePlaylist().then( ()=> { content.next() })
setInterval(()=>{ content.updatePlaylist() }, 20000) // 20 seconds

var printer = new Printer(conf.printer, { printer: window.ipc.printer, logger: window.ipc.logger })
printer.init()

var ws = new wSocket(conf.server, ui.exColas, printer, window.ipc.logger )
ws.init()

time()
setInterval(time, 5000)

/*=====  End of MAIN  ======*/



// Atajos de teclado para testeo
window.onkeyup = (e)=> {
  switch (e.keyCode) {
    // Enter: Siguiente contenido
    case 13:
      content.next()
      window.ipc.logger.std({origin: 'USER', event: 'SKIP_CONTENT', message: ''})
    break
    // P: Pausa
    case 80:
      content.togglePause()
    break
  }
}