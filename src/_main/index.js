function $(i){return document.getElementById(i)}
const {remote, ipcRenderer} = require('electron')
const conf = remote.getGlobal('appConf')
const ui = remote.getGlobal('interface')


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

function modalBox(id, type, header='', msg='') {
  if ( type ) { // Añadir
    if (!document.contains( $(id) )) {
      let modal = document.createElement('div')
      modal.id = id
      modal.className = `modalBox ${type}`
      modal.innerHTML = `<div><h1>${header}</h1><p>${msg}</p></div>`    
      document.body.appendChild(modal)
    } else {
        $$(`#${id} > div > h1`).textContent = header
        $$(`#${id} > div > p`).textContent = msg
    }
  } else { // Si type es falso, es que se quiere destruir el modal
    try { $(id).remove()} catch(e){}
  }
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
document.adoptedStyleSheets = [css]

var content = new Content(conf.contentDir, ipcRenderer)
content.updatePlaylist().then( ()=> { content.next() })
setInterval('content.updatePlaylist()', 60000) // 60 seconds

var printer = new Printer(conf.printer.type, conf.printer.ip, conf.printer.port, ipcRenderer)
printer.init()

var ws = new wSocket(conf.server.ip, conf.server.port, ui, printer, ipcRenderer)
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
      this.ipc.send('log', {origin: 'USER', event: 'SKIP_CONTENT', message: ''})
    break
    // P: Pausa
    case 80:
      content.togglePause()
    break
  }
}