import {$, $$, tabNav, displayGroup} from '../exports.web.js'

var CONF = window.ipc.get.appConf()

async function saveConf() {
    CONF.touchScreen = $('touchScreen').checked
    CONF.deployDir = $('deployDir').value
    CONF.logsDir = $('logsDir').value

    CONF.server.ip =   $('serverIp').value != ''? $('serverIp').value : $('serverIp').placeholder
    CONF.server.port = parseInt( $('serverPort').value != ''? $('serverPort').value : $('serverPort').placeholder )
    CONF.printer.type = parseInt($('printerType').value)
    CONF.printer.ticket.disabled = $('printDisable').checked
    CONF.printer.ip =  $('printerIp').value != ''? $('printerIp').value : $('printerIp').placeholder
    CONF.printer.port = parseInt( $('printerPort').value != ''? $('printerPort').value : $('printerPort').placeholder )
    CONF.printer.ticket.width = parseInt( $('ticketWidth').value != ''? $('ticketWidth').value : $('ticketWidth').placeholder )

    CONF.window.type = parseInt($('windowType').value)
    CONF.window.height = parseInt( $('windowSizeY').value != ''? $('windowSizeY').value : $('windowSizeY').placeholder )
    CONF.window.width = parseInt( $('windowSizeX').value != ''? $('windowSizeX').value : $('windowSizeX').placeholder )
    CONF.window.posX = parseInt( $('windowPosX').value != ''? $('windowPosX').value : $('windowPosX').placeholder )
    CONF.window.posY = parseInt( $('windowPosY').value != ''? $('windowPosY').value : $('windowPosY').placeholder )
    CONF.window.alwaysOnTop = $('alwaysOnTop').checked
    
    CONF.interface.info = $('infoBar').checked
    CONF.interface.type = parseInt($('interfaceType').value)
    CONF.interface.ticketAreaSize = parseInt($('ticketAreaSize').value)

    CONF.interface.colors.app = $('appColor').value
    CONF.interface.colors.main = $('mainColor').value
    CONF.interface.colors.secondary = $('secondaryColor').value

    CONF.interface.colas.excluir = Array.from( $('exColas').selectedOptions ).map(el => parseInt(el.value))


    //const reader = new FileReader()
    let files=[], file, dataUrl
    // Imagen derecha
    file = $('rightBarImg').files[0]
    if (!!file) {
        dataUrl = await readFileAsDataURL(file)
        files.push( {name: '/img/rightBarImg.png', file: dataUrl.substring(22)} )
    }

    // Imagen central
    file = $('midBarImg').files[0]
    if (!!file) {
        dataUrl = await readFileAsDataURL(file)
        files.push( {name: '/img/midBarImg.png', file: dataUrl.substring(22)} )
    }

    // Imagen de pie de pagina de tickets
    file = $('printFooter').files[0]
    if (!!file) {
        dataUrl = await readFileAsDataURL(file)
        files.push( {name: '/img/printFooter.png', file: dataUrl.substring(22)} )
    }


    window.ipc.save.appConf( CONF, files )
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
    if ( $('config').checkValidity() )  { saveConf() }
    else                                { $('config').reportValidity() }
}

$('deployDirExplore').onclick = (e)=> {
    e.preventDefault()
    let dir = window.ipc.dialog.saveDir({dir: $('deployDir').value, file:'deploy.json'})
    $('deployDir').value = dir
}

$('logsDirExplore').onclick = (e)=> {
    e.preventDefault()
    let dir = window.ipc.dialog.saveDir({dir: $('logsDir').value, file:false})
    $('logsDir').value = dir
}



$('windowType').onchange = (e) => { 
    switch (e.currentTarget.value) {
        case '0': //Fullscreen
            $('windowSizeX').disabled = true;  $('windowSizeY').disabled = true
            $('windowPosX').disabled = true;  $('windowPosY').disabled = true
        break

        case '1': // Sin bordes
            $('windowSizeX').disabled = false;  $('windowSizeY').disabled = false
            $('windowPosX').disabled = false;  $('windowPosY').disabled = false
        break

        case '2': // Normal
            $('windowSizeX').disabled = false;  $('windowSizeY').disabled = false
            $('windowPosX').disabled = true;  $('windowPosY').disabled = true
    }
}

$('interfaceType').onchange = (e)=> { displayGroup($('tab-aspecto'), e.currentTarget.value) }
$('printerType').onchange = (e)=> { displayGroup($('tab-impresion'), e.currentTarget.value) }

// Initialization
$('touchScreen').checked = CONF.touchScreen
$('deployDir').value = CONF.deployDir
$('transitionDuration').value = CONF.media.transitionDuration
$('logsDir').value = CONF.logsDir
$('serverIp').value = CONF.server.ip
$('serverPort').value = CONF.server.port
$('printerType').value = CONF.printer.type
$('printDisable').checked = CONF.printer.ticket.disabled
$('printerIp').value = CONF.printer.ip
$('printerPort').value = CONF.printer.port
$('ticketWidth').value = CONF.printer.ticket.width

$('windowType').value = CONF.window.type
$('windowSizeX').value = CONF.window.width
$('windowSizeY').value = CONF.window.height
$('windowPosX').value = CONF.window.posX
$('windowPosY').value = CONF.window.posY
$('alwaysOnTop').checked = CONF.window.alwaysOnTop

$('infoBar').checked = CONF.interface.info
$('interfaceType').value = CONF.interface.type
$('ticketAreaSize').value = CONF.interface.ticketAreaSize

$('appColor').value = CONF.interface.colors.app
$('mainColor').value = CONF.interface.colors.main
$('secondaryColor').value = CONF.interface.colors.secondary

CONF.interface.colas.excluir.forEach(num => { $$(`#exColas option[value='${num}'`).selected = true })

canvasThumb(`file://${window.ipc.get.path('userData')}/_custom/printFooter.png`, $('canvasPrintFooter'), 1000, 250)

const event = new Event('change')
$('windowType').dispatchEvent(event)
$('printerType').dispatchEvent(event)
$('interfaceType').dispatchEvent(event)

tabNav( $('configTabs'), $('configTabsContent'))