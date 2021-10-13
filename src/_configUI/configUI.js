import {$, $$, $$$} from '../exports.web.js'

const ev = new Event('change')
var UI = window.ipc.get.interface()

function saveConfigUI() {
    UI.info = $('info').checked
    UI.type = parseInt($('type').value)
    UI.ticketAreaSize = parseInt($('ticketAreaSize').value)

    UI.colors.main = $('mainColor').value
    UI.colors.secondary = $('secondaryColor').value

    UI.exColas = Array.from( $('exColas').selectedOptions ).map(el => parseInt(el.value))

    // Imagen derecha
    if (typeof $('rightBarImg').files[0] != 'undefined') {
        UI.rightBarImg = {name: 'rightBarImg.png', file: $('canvasRightBarImg').toDataURL("image/png").substring(22)}
    }

    // Imagen central
    if (typeof $('midBarImg').files[0] != 'undefined') {
        UI.midBarImg = {name: 'midBarImg.png', file: $('canvasMidBarImg').toDataURL("image/png").substring(22)}
    }

    window.ipc.save.interface(UI)
}

function canvasThumb(file, canvas, width, height) {
    canvas.width = width
    canvas.height = height
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
    var img = document.createElement('img')
    img.src = file

    img.onload = ()=> {
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height )
    }
}

function clearCanvas(canvas) {
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
}

$('rightBarImg').onchange = (e) => { 
    if (typeof e.currentTarget.files[0] != 'undefined')     { canvasThumb(URL.createObjectURL(e.currentTarget.files[0]), $('canvasRightBarImg'), 1000, 250) } 
    else                                                    { clearCanvas($('canvasRightBarImg')) }
}

$('midBarImg').onchange = (e) => { 
    if (typeof e.currentTarget.files[0] != 'undefined')     { canvasThumb(URL.createObjectURL(e.currentTarget.files[0]), $('canvasMidBarImg'), 1000, 180) } 
    else                                                    { clearCanvas($('canvasMidBarImg')) }
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
    $('mainColor').value = '#7eb031'
    $('secondaryColor').value = '#ffffff'
    $$$(`#exColas option`).forEach( el => { el.selected = false })
    $('type').dispatchEvent(ev)
}

// Initialization
$('info').checked = UI.info
$('type').value = UI.type
$('ticketAreaSize').value = UI.ticketAreaSize

$('mainColor').value = UI.colors.main
$('secondaryColor').value = UI.colors.secondary

UI.exColas.forEach(num => { $$(`#exColas option[value='${num}'`).selected = true })

canvasThumb(`file://${window.ipc.get.path('userData')}/_custom/rightBarImg.png`, $('canvasRightBarImg'), 1000, 250)
canvasThumb(`file://${window.ipc.get.path('userData')}/_custom/midBarImg.png`, $('canvasMidBarImg'), 1000, 250)

$('type').dispatchEvent(ev)