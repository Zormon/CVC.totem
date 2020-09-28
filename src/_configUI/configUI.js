function $(id)      { return document.getElementById(id)    }
function $$(id)     { return document.querySelector(id)     }
function $$$(id)    { return document.querySelectorAll(id)  }

const remote = require('electron').remote
const { ipcRenderer, contextBridge } = require('electron')
const event = new Event('change')

var interface = remote.getGlobal('interface')

function saveConfigUI() {
    interface.info = $('info').checked
    interface.type = parseInt($('type').value)

    interface.colors.main = $('mainColor').value
    interface.colors.secondary = $('secondaryColor').value

    interface.exColas = Array.from( $('exColas').selectedOptions ).map(el => parseInt(el.value))

    ipcRenderer.send('saveInterface', interface )
}

$('save').onclick = (e)=> {
    e.preventDefault()
    if ( $('configUI').checkValidity() )    { saveConfigUI() } 
    else                                    { $('configUI').reportValidity() }
}

$('default').onclick = (e)=> {
    e.preventDefault()
    $('info').checked = true
    $('type').value = 0
    $('footerLogo').value = null
    $('mainColor').value = '#7eb031'
    $('secondaryColor').value = '#ffffff'
    $('type').dispatchEvent(event)
}

// Initialization
$('info').checked = interface.info
$('type').value = interface.type

$('mainColor').value = interface.colors.main
$('secondaryColor').value = interface.colors.secondary

interface.exColas.forEach(num => { $$(`#exColas option[value='${num}'`).selected = true })