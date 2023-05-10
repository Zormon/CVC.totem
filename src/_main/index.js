import wSocket from './wSocketTotem.class.js'
import Content from './content.class.js'
import Printer from './printer.class.js'
import {$,shadeColor} from '../exports.web.js'
const CONF = window.ipc.get.appConf()

function time() {
  let date = new Date
  $('time').textContent = date.getHours().toString().padStart(2,'0') + ':' + date.getMinutes().toString().padStart(2,'0')
}


// Aplica CSS basado en la configuracion
if (!CONF.interface.info) { document.body.classList.add('noInfo') }
const css = new CSSStyleSheet()

// Colores
css.insertRule(` :root { --app-color: ${CONF.interface.colors.app};  } `)
css.insertRule(` :root { --main-color: ${CONF.interface.colors.main};  } `)
css.insertRule(` :root { --main-color-light: ${shadeColor(CONF.interface.colors.main, 30)}; } `)
css.insertRule(` :root { --main-color-dark: ${shadeColor(CONF.interface.colors.main, -30)}; } `)
css.insertRule(` :root { --secondary-color: ${CONF.interface.colors.secondary}; } `)
css.insertRule(` :root { --secondary-color-light: ${shadeColor(CONF.interface.colors.secondary, 30)}; } `)
css.insertRule(` :root { --secondary-color-dark: ${shadeColor(CONF.interface.colors.secondary, -30)}; } `)
css.insertRule(` :root { --transition-duration: ${CONF.media.transitionDuration}s } `)

// Ancho de zona de tickets
switch (CONF.interfacetype) {
  case 0: // Vertical
    // No implementado
  break
  case 1: // Horizontal
    css.insertRule(` body { grid-template-columns: ${CONF.interfaceticketAreaSize}% auto !important; } `)
  break
}
document.adoptedStyleSheets = [css]

$('midImg').src = `file://${window.ipc.get.path('userData')}/_custom/midBarImg.png`
$('rightImg').src = `file://${window.ipc.get.path('userData')}/_custom/rightBarImg.png`


var content = new Content(CONF.deployDir, false, window.ipc.logger, {transition_duration: CONF.media.transitionDuration} )
content.updatePlaylist().then( ()=> { content.next() })
setInterval(()=>{ content.updatePlaylist() }, 20000) // 20 seconds

var printer = new Printer(CONF.printer, window.ipc)
printer.init()

var ws = new wSocket(CONF, content, printer, window.ipc, {pan:true, touchScreen: CONF.touchScreen} )
ws.init()

time(); setInterval(time, 5000)



// Atajos de teclado para testeo
window.onkeyup = (e)=> {
  switch (e.key) {
    case 'Enter':
      content.next()
      window.ipc.logger.std({origin: 'USER', event: 'SKIP_CONTENT', message: ''})
    break
    case 'p':
      content.togglePause()
    break
  }
}