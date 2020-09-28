function $(id)      { return document.getElementById(id)    }
function $$(id)     { return document.querySelector(id)     }
function $$$(id)    { return document.querySelectorAll(id)  }
function sleep(ms) { return new Promise(r => setTimeout(r, ms)) }

const remote = require('electron').remote
const { ipcRenderer } = require('electron')
const prefs = remote.getGlobal('appConf')

var colas = {}

async function saveConfig() {
    let cols = []
    $$$('#colas div.cola').forEach(el => { 
        let col = {'nombre': el.children[0].value, 'color': el.children[1].value}
        cols.push( col ) 
    })

    let data = await fetch(`http://${prefs.server.ip}:${prefs.server.port}/setColas`, {
        method: 'POST', headers: { 'Accept': 'application/json', 'Content-Type': 'application/json'},
        body: JSON.stringify( cols )
      }).then( resp => resp.json() )
    

    if (data.status=='ok')      { return true }
    else                        { return data.error }
}

function printColas() {
    let divColas = $('colas')
    while (divColas.firstChild) { divColas.removeChild(divColas.firstChild) }
    for (let i=0; i< $('ncolas').value; i++) {
        let nombre = document.createElement('input')
        let color = document.createElement('input')
        let cola = document.createElement('div')
        cola.className = 'cola'

        if (typeof colas[i] != 'undefined')         { nombre.value = colas[i].nombre;   color.value = colas[i].color }
        else                                        { nombre.value = `Cola ${i+1}`;     color.value = '#000' }

        // Nombre
        nombre.type = 'text'
        nombre.pattern = '[A-Za-z0-9 ]{1,20}'
        nombre.placeholder = `Cola ${i}`
        nombre.required = true
        nombre.title = 'Solo texto, espacios y numeros. 20 caracteres máximo'        
        // Color
        color.type = 'color'
        color.required = 'true'

        cola.appendChild(nombre)
        cola.appendChild(color)
        divColas.appendChild(cola)
    }
}


// Initialization
fetch(`http://${prefs.server.ip}:${prefs.server.port}/getColas`).then( resp => resp.json() )
.then( (data)=> {
        $('ncolas').value = data.colas.length
        colas = data.colas
        printColas()

        $('ncolas').onchange = ()=> { printColas() }

        $('save').onclick = async(e)=> {
            e.preventDefault()
            if ( $('config').checkValidity() ) {
                if ( await saveConfig() == true) {
                    remote.getCurrentWindow().close()           
                }
            } else { 
                $('config').reportValidity()
            }
        }
})