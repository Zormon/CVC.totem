function $(id)      { return document.getElementById(id)    }
function $$(id)     { return document.querySelector(id)     }
function $$$(id)    { return document.querySelectorAll(id)  }

const remote = require('electron').remote
const { ipcRenderer } = require('electron')
var prefs = remote.getGlobal('appConf')

function savePreferences() {
    prefs.contentDir = $('contentDir').value
    prefs.logsDir = $('logsDir').value

    prefs.server.ip =   $('serverIp').value != ''? $('serverIp').value : $('serverIp').placeholder
    prefs.server.port = parseInt( $('serverPort').value != ''? $('serverPort').value : $('serverPort').placeholder )
    prefs.printer.ip =  $('printerIp').value != ''? $('printerIp').value : $('printerIp').placeholder
    prefs.printer.port = parseInt( $('printerPort').value != ''? $('printerPort').value : $('printerPort').placeholder )

    prefs.window.type = parseInt($('windowType').value)
    prefs.window.sizeX = parseInt( $('windowSizeX').value != ''? $('windowSizeX').value : $('windowSizeX').placeholder )
    prefs.window.sizeY = parseInt( $('windowSizeY').value != ''? $('windowSizeY').value : $('windowSizeY').placeholder )
    prefs.window.posX = parseInt( $('windowPosX').value != ''? $('windowPosX').value : $('windowPosX').placeholder )
    prefs.window.posY = parseInt( $('windowPosY').value != ''? $('windowPosY').value : $('windowPosY').placeholder )

    // Imagen de logo
    if (typeof $('printFooter').files[0] != 'undefined') {
        prefs.printLogo = {name: 'printFooter.png', file: $('canvasFooter').toDataURL("image/png").substring(22)}
    }

    ipcRenderer.send('savePrefs', prefs )
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

$('printFooter').onchange = (e) => { 
    if (typeof e.currentTarget.files[0] != 'undefined')     { canvasThumb(e.currentTarget, $('canvasFooter'), 240, 60) } 
    else                                                    { clearCanvas($('canvasFooter')) }
}

$('save').onclick = (e)=> {
    e.preventDefault()
    if ( $('config').checkValidity() ) {
        savePreferences()
    } else { 
        $('config').reportValidity()
    }
}

$('contentDir').onclick = ()=> {
    let dir = ipcRenderer.sendSync('saveDirDialog', {dir: $('contentDir').value, file:'lista.xml'})
    $('contentDir').value = dir
}

$('logsDir').onclick = ()=> {
    let dir = ipcRenderer.sendSync('saveDirDialog', {dir: $('logsDir').value, file:false})
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

// Initialization
$('contentDir').value = prefs.contentDir
$('logsDir').value = prefs.logsDir
$('serverIp').value = prefs.server.ip
$('serverPort').value = prefs.server.port
$('printerIp').value = prefs.printer.ip
$('printerPort').value = prefs.printer.port

$('windowType').value = prefs.window.type
$('windowSizeX').value = prefs.window.sizeX
$('windowSizeY').value = prefs.window.sizeY
$('windowPosX').value = prefs.window.posX
$('windowPosY').value = prefs.window.posY

const event = new Event('change')
$('windowType').dispatchEvent(event)