import {$} from '../exports.web.js'

var CONF = window.ipc.get.appConf()

function savePreferences() {
    CONF.touch = $('touch').checked
    CONF.contentDir = $('contentDir').value
    CONF.logsDir = $('logsDir').value

    CONF.server.ip =   $('serverIp').value != ''? $('serverIp').value : $('serverIp').placeholder
    CONF.server.port = parseInt( $('serverPort').value != ''? $('serverPort').value : $('serverPort').placeholder )
    CONF.printer.type = parseInt($('printerType').value)
    CONF.printer.ticket.disabled = $('printDisable').checked
    CONF.printer.ip =  $('printerIp').value != ''? $('printerIp').value : $('printerIp').placeholder
    CONF.printer.port = parseInt( $('printerPort').value != ''? $('printerPort').value : $('printerPort').placeholder )
    CONF.printer.ticket.width = parseInt( $('ticketWidth').value != ''? $('ticketWidth').value : $('ticketWidth').placeholder )

    CONF.window.type = parseInt($('windowType').value)
    CONF.window.height = parseInt( $('windowHeight').value != ''? $('windowHeight').value : $('windowHeight').placeholder )
    CONF.window.width = parseInt( $('windowWidth').value != ''? $('windowWidth').value : $('windowWidth').placeholder )
    CONF.window.posX = parseInt( $('windowPosX').value != ''? $('windowPosX').value : $('windowPosX').placeholder )
    CONF.window.posY = parseInt( $('windowPosY').value != ''? $('windowPosY').value : $('windowPosY').placeholder )

    // Imagen de pie de pagina
    if (typeof $('printFooter').files[0] != 'undefined') {
        CONF.printFooter = {name: 'printFooter.png', file: $('canvasPrintFooter').toDataURL("image/png").substring(22)}
    }

    window.ipc.save.appConf( CONF )
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

$('printFooter').onchange = (e) => { 
    if (typeof e.currentTarget.files[0] != 'undefined')     { canvasThumb(URL.createObjectURL(e.currentTarget.files[0]), $('canvasPrintFooter'), 240, 60) } 
    else                                                    { clearCanvas($('canvasPrintFooter')) }
}

$('save').onclick = (e)=> {
    e.preventDefault()
    if ( $('config').checkValidity() )  { savePreferences() }
    else                                { $('config').reportValidity() }
}

$('contentDir').onclick = ()=> {
    let dir = window.ipc.dialog.saveDir({dir: $('contentDir').value, file:'lista.xml'})
    $('contentDir').value = dir
}

$('logsDir').onclick = ()=> {
    let dir = window.ipc.dialog.saveDir({dir: $('logsDir').value, file:false})
    $('logsDir').value = dir
}

$('printerType').onchange = (e) => { 
    switch (parseInt(e.currentTarget.value)) {
        case 0: // ePOS
            $('printerIp').disabled = false
            $('printerPort').disabled = false
        break
        case 1: // USB
            $('printerIp').disabled = true
            $('printerPort').disabled = true
        break
    }
}

$('windowType').onchange = (e) => { 
    switch (e.currentTarget.value) {
        case '0': //Fullscreen
            $('windowWidth').disabled = true;  $('windowHeight').disabled = true
            $('windowPosX').disabled = true;  $('windowPosY').disabled = true
        break

        case '1': // Sin bordes
            $('windowWidth').disabled = false;  $('windowHeight').disabled = false
            $('windowPosX').disabled = false;  $('windowPosY').disabled = false
        break

        case '2': // Normal
            $('windowWidth').disabled = false;  $('windowHeight').disabled = false
            $('windowPosX').disabled = true;  $('windowPosY').disabled = true
    }
}

// Initialization
$('touch').checked = CONF.touch
$('contentDir').value = CONF.contentDir 
$('logsDir').value = CONF.logsDir
$('serverIp').value = CONF.server.ip
$('serverPort').value = CONF.server.port
$('printerType').value = CONF.printer.type
$('printDisable').checked = CONF.printer.ticket.disabled
$('printerIp').value = CONF.printer.ip
$('printerPort').value = CONF.printer.port
$('ticketWidth').value = CONF.printer.ticket.width

$('windowType').value = CONF.window.type
$('windowWidth').value = CONF.window.width
$('windowHeight').value = CONF.window.height
$('windowPosX').value = CONF.window.posX
$('windowPosY').value = CONF.window.posY

canvasThumb(`file://${window.ipc.get.path('userData')}/_custom/printFooter.png`, $('canvasPrintFooter'), 1000, 250)

const event = new Event('change')
$('windowType').dispatchEvent(event)
$('printerType').dispatchEvent(event)