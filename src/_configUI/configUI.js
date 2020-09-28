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

        // Imagen de logo
        if (typeof $('footerLogo').files[0] != 'undefined') {
            interface.logo = {name: 'logoCliente.png', file: $('canvasLogo').toDataURL("image/png").substring(22)}
        }
    
        // Imagen de barra
        if (typeof $('barImg').files[0] != 'undefined') {
            interface.barImg = {name: 'barImage.png', file: $('canvasBarImg').toDataURL("image/png").substring(22)}
        }

    ipcRenderer.send('saveInterface', interface )
}

function canvasThumb(event, canvas, width, height) {
    canvas.width = width
    canvas.height = height
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
    var img = document.createElement('img')
    img.src = URL.createObjectURL( event.files[0] )

    img.onload = ()=> {
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height )
    }
}

function clearCanvas(canvas) {
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
}

$('footerLogo').onchange = (e) => { 
    if (typeof e.currentTarget.files[0] != 'undefined')     { canvasThumb(e.currentTarget, $('canvasLogo'), 1000, 250) } 
    else                                                    { clearCanvas($('canvasLogo')) }
}

$('barImg').onchange = (e) => { 
    if (typeof e.currentTarget.files[0] != 'undefined')     { canvasThumb(e.currentTarget, $('canvasBarImg'), 1000, 180) } 
    else                                                    { clearCanvas($('canvasBarImg')) }
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
    $$$(`#exColas option`).forEach( el => { el.selected = false })
    $('type').dispatchEvent(event)
}

// Initialization
$('info').checked = interface.info
$('type').value = interface.type

$('mainColor').value = interface.colors.main
$('secondaryColor').value = interface.colors.secondary

interface.exColas.forEach(num => { $$(`#exColas option[value='${num}'`).selected = true })