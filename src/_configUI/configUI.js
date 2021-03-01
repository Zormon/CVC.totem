import {$, $$, $$$} from '../exports.web.js'

const event = new Event('change')
var UI = window.ipc.get.interface()

function saveConfigUI() {
    UI.info = $('info').checked
    UI.type = parseInt($('type').value)
    UI.ticketAreaSize = parseInt($('ticketAreaSize').value)

    UI.colors.main = $('mainColor').value
    UI.colors.secondary = $('secondaryColor').value

    UI.exColas = Array.from( $('exColas').selectedOptions ).map(el => parseInt(el.value))

    // Imagen de logo
    if (typeof $('footerLogo').files[0] != 'undefined') {
        UI.logo = {name: 'logoCliente.png', file: $('canvasLogo').toDataURL("image/png").substring(22)}
    }

    // Imagen de barra
    if (typeof $('barImg').files[0] != 'undefined') {
        UI.barImg = {name: 'barImage.png', file: $('canvasBarImg').toDataURL("image/png").substring(22)}
    }

    window.ipc.save.interface(UI)
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

$('type').onchange = (e) => {
    switch (parseInt(e.currentTarget.value)) {
        case 0: // Vertical
            $('ticketAreaSize').parentElement.style.display = 'none'
        break
        case 1: // Horizontal
            $('ticketAreaSize').parentElement.style.display = ''
        break
    }
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
    $('ticketAreaSize').value = 50
    $('footerLogo').value = null
    $('mainColor').value = '#7eb031'
    $('secondaryColor').value = '#ffffff'
    $$$(`#exColas option`).forEach( el => { el.selected = false })
    $('type').dispatchEvent(event)
}

// Initialization
$('info').checked = UI.info
$('type').value = UI.type
$('ticketAreaSize').value = UI.ticketAreaSize

$('mainColor').value = UI.colors.main
$('secondaryColor').value = UI.colors.secondary

UI.exColas.forEach(num => { $$(`#exColas option[value='${num}'`).selected = true })

const ev = new Event('change')
$('type').dispatchEvent(ev)