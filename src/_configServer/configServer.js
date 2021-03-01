import {$, $$$} from '../exports.web.js'

var CONF = window.ipc.get.appConf()
var colas = {}

async function saveConfig() {
    let cols = []
    $$$('#colas div.cola').forEach(el => { 
        let col = {'nombre': el.children[0].value, 'color': el.children[1].value, 'icon': el.children[2].value}
        cols.push( col ) 
    })

    // Set Colas
    let data = await fetch(`http://${CONF.server.ip}:${CONF.server.port}/setConfig`, {
        method: 'POST', headers: { 'Accept': 'application/json', 'Content-Type': 'application/json'},
        body: JSON.stringify( { pan: $('pan').checked, colas: cols } )
      }).then( resp => resp.json() )
    if (data.status!='ok')      { return data.error }

    return true
}

function printColas() {
    let divColas = $('colas')
    while (divColas.firstChild) { divColas.removeChild(divColas.firstChild) }
    for (let i=0; i< $('ncolas').value; i++) {
        let nombre = document.createElement('input')
        let color = document.createElement('input')
        let icon = document.createElement('select')
        let cola = document.createElement('div')
        cola.className = 'cola'

        // Nombre
        nombre.type = 'text'
        nombre.pattern = '[A-Za-z0-9 ]{1,20}'
        nombre.placeholder = `Cola ${i}`
        nombre.required = true
        nombre.title = 'Solo texto, espacios y numeros. 20 caracteres máximo'        
        // Color
        color.type = 'color'
        color.required = 'true'
        
        // Icon
        icon.className = 'icon'
        let tpl = $('icons').content.cloneNode(true)
        icon.appendChild(tpl)
        
        if (typeof colas[i] != 'undefined')         { nombre.value = colas[i].nombre;   color.value = colas[i].color;   icon.selectedIndex = colas[i].icon }
        else                                        { nombre.value = `Cola ${i+1}`;     color.value = '#000';           icon.selectedIndex = 0 }
        cola.appendChild(nombre)
        cola.appendChild(color)
        cola.appendChild(icon)
        divColas.appendChild(cola)
    }
}


// Initialization
fetch(`http://${CONF.server.ip}:${CONF.server.port}/getConfig`).then( resp => resp.json() )
.then( (data)=> {
        $('pan').checked = data.pan

        $('ncolas').value = data.colas.length
        colas = data.colas
        printColas()

        $('ncolas').onchange = ()=> { printColas() }

        $('save').onclick = async(e)=> {
            e.preventDefault()
            if ( $('config').checkValidity() ) { saveConfig() }
            else { $('config').reportValidity() }
        }
})