const appName = 'totem'
const { app, BrowserWindow, Menu, ipcMain, dialog, screen } = require('electron')
const { exec } = require("child_process")
const fs = require("fs")
const path = require('path')
const logger = require('./log.js')
const isLinux = process.platform === "linux"
const restartCommandShell =  `~/system/scripts/appsCvc restart ${appName} &`

var appWin, configWin, configServerWin, configUIWin;

/*=============================================
=            Preferencias            =
=============================================*/

  const CONFIG_FILE = `${app.getPath('userData')}/_custom/APPCONF.json`
  const CONFIGUI_FILE = `${app.getPath('userData')}/_custom/APPCONFUI.json`

  // Defaults
  const DEFAULT_CONFIG = { 
    contentDir: '/home/cvc/_contenidos',
    logsDir: '/home/cvc/telemetry/apps',
    exColas: [],
    server: {
      ip:'127.0.0.1',
      port: 3000,
    },
    printer: {
      touch: true,
      type: 0,
      ip:'192.168.1.241',
      port: 8008,
      ticket: {
        width: 300,
        disabled: false
      }
    },
    window: {
      type: 0,
      posX: 0,
      posY: 0,
      height: 480,
      width: 848
    }
  }

  const DEFAULT_UI = {
    info: true,
    type: 0,
    ticketAreaSize: 40,
    exColas: [],
    colors: {
      main: '#7eb031',
      secondary: '#ffffff'
    }
  }

  if ( !(global.APPCONF = loadConfigFile(CONFIG_FILE)) )      { global.APPCONF = DEFAULT_CONFIG }
  if ( !(global.UI = loadConfigFile(CONFIGUI_FILE)) )         { global.UI = DEFAULT_UI }

  if (global.APPCONF.touch)   { app.commandLine.appendSwitch('touch-events', 'enabled') }


/*=====  End of Preferencias  ======*/



/*=============================================
=            Menu            =
=============================================*/

  const menu = [
    {
        role: 'appMenu',
        label: 'Archivo',
        submenu: [
            {label:'Reiniciar', accelerator: 'CmdOrCtrl+R', click() { restart() } },
            {role:'forcereload', label:'Refrescar' },
            {role: 'quit', label:'Salir'}
        ]
    },{
        label: 'Editar',
        submenu: [
            {label:'Ajustes', accelerator: 'CmdOrCtrl+E',  click() {
              if (configWin == null)  { config() } 
              else                    { configWin.focus() } 
            }},
            {label:'Interfaz', accelerator: 'CmdOrCtrl+P',  click() {
              if (!configUIWin)       { configUI() } 
              else                    { configUIWin.focus() } 
            }},
            {label:'Ajustes del servidor', accelerator: 'CmdOrCtrl+S',  click() {
              if (configServerWin == null)     { configServer() } 
              else                             { configWin.focus() } 
            }},
            {type: 'separator'},
            {label:'Restaurar parámetros',     click() { restoreDialog() } }
        ]
    }
    ,{
      role: 'help',
      label: 'Ayuda',
      submenu: [
          {label:'Información',     click() { about() } },
          {role: 'toggledevtools', label:'Consola Web'}
      ]
  }
  ]

/*=====  End of Menu  ======*/



/*=============================================
=            Funciones            =
=============================================*/

  function restart() {
    if (isLinux) {
      exec(restartCommandShell, (err, stdout)=> {})
    } else {
      app.relaunch()
      app.quit()
    }
  }

  function saveConfFile(prefs, file) {
    fs.writeFileSync(file, JSON.stringify(prefs), 'utf8')
  }

  function loadConfigFile(file) {
    if (fs.existsSync(file)) {
      try {
        let data = JSON.parse(fs.readFileSync(file, 'utf8'))
        return data
      } catch (error) { return false }
    } else { return false}
  }

  function restore() {
    saveConfFile(DEFAULT_CONFIG, CONFIG_FILE)
    saveConfFile(DEFAULT_UI, CONFIGUI_FILE)
    restart() 
  }

  function restoreDialog() {
    const options  = {
      type: 'warning',
      buttons: ['Cancelar','Aceptar'],
      message: '¿Restaurar los valores por defecto de la configuración de la aplicación?'
    }
    dialog.showMessageBox(options, (resp) => { if (resp) { restore(); restart() } }) // Ha pulsado aceptar
  }

/*=====  End of Funciones  ======*/



/*=============================================
=            Ventanas            =
=============================================*/

  function initApp() {
    let windowOptions = {autoHideMenuBar: true, resizable:true, show: false, webPreferences: {spellcheck:false, preload: path.join(__dirname, "preload.js") }, icon: `${app.getAppPath()}/icon64.png`}
    if      (APPCONF.window.type == 0)   { windowOptions.fullscreen = true }
    else if (APPCONF.window.type == 1)   { windowOptions.frame = false; windowOptions.alwaysOnTop = true } // Borderless
    appWin = new BrowserWindow(windowOptions)

    switch (APPCONF.window.type) {
      case 0: // Fullscreen
        screen.on('display-metrics-changed', restart )
      break
      case 1: // Borderless
        appWin.setPosition( APPCONF.window.posX, APPCONF.window.posY)
      case 2: // Normal Window
        appWin.setSize(APPCONF.window.width, APPCONF.window.height)
        appWin.setResizable(false)
      break
    }

    let tpl
    switch(UI.type) {
      case 0: // Vertical
        tpl = '_vertical'
      break;
      case 1: // Horizontal
        tpl = '_horizontal'
      break;
    }

    appWin.loadFile(`${__dirname}/_main/${tpl}.html`)
    appWin.setTitle(appName)
    appWin.on('page-title-updated', (e)=>{ e.preventDefault()})
    Menu.setApplicationMenu( Menu.buildFromTemplate(menu) )
    appWin.show()
    appWin.on('closed', () => { logs.log('MAIN','QUIT',''); app.quit() })

    logs.log('MAIN','START','')
    //appWin.webContents.openDevTools()
  }

  function config() {
    const winOptions = {
      width: 720, height: 550, show:false, parent: appWin, modal:true, resizable:false, 
      webPreferences: { spellcheck:false, preload: path.join(__dirname, "preload.js") }
    }
    configWin = new BrowserWindow(winOptions)
    configWin.loadFile(`${__dirname}/_config/config.html`)
    configWin.setMenu( null )
    configWin.show()
    
    configWin.on('closed', () => { configWin = null })
    //configWin.webContents.openDevTools()
  }

    // Ventana de personalizacion de interfaz
    function configUI() {
      const winOptions = {
        width: 700, height: 460, show:false, parent: appWin, modal:true, resizable:false, 
        webPreferences: { spellcheck:false, preload: path.join(__dirname, "preload.js") }
      }
      configUIWin = new BrowserWindow(winOptions)
      configUIWin.loadFile(`${__dirname}/_configUI/configUI.html`)
      configUIWin.setMenu( null )
      configUIWin.show()
      
      configUIWin.on('closed', () => { configUIWin = null })
      //configUIWin.webContents.openDevTools()
    }

  function configServer() {
    const winOptions = {
      width: 400, height: 550, show:false, parent: appWin, modal:true, resizable:false, 
      webPreferences: { spellcheck:false, preload: path.join(__dirname, "preload.js") }
    }
    configServerWin = new BrowserWindow(winOptions)
    configServerWin.loadFile(`${__dirname}/_configServer/configServer.html`)
    configServerWin.setMenu( null )
    configServerWin.show()
    
    configServerWin.on('closed', () => { configServerWin = null })
    //configServerWin.webContents.openDevTools()
  }

  function about() {
    const options  = {
      type: 'info',
      buttons: ['Aceptar'],
      message: `${appName} \nComunicacion Visual Canarias 2020\nContacto: 928 67 29 81`
     }
    dialog.showMessageBox(appWin, options)
  }

/*=====  End of Ventanas  ======*/


app.setAppLogsPath(global.APPCONF.logsDir)
app.on('ready', initApp)


/*=============================================
=                 IPC signals                 =
=============================================*/

ipcMain.on('execShell', (e, cmd) => {
  exec(cmd)
})

ipcMain.on('getGlobal', (e, type) => {
  switch(type) {
    case 'appConf':
      e.returnValue = global.APPCONF
    break
    case 'interface':
      e.returnValue = global.UI
    break
  }
})

ipcMain.on('getPath', (e, dir) => {
  e.returnValue = app.getPath(dir)
})

ipcMain.on('printImg', (e, img) => {
  var data = img.replace(/^data:image\/\w+;base64,/, "")
  var buf = Buffer.from(data, 'base64')
  fs.writeFileSync(app.getPath('temp')+'/ticket.png', buf)
  // Imprimir realmente
  if (isLinux) {
    exec(`lp ${app.getPath('temp')+'/ticket.png'}`, (err, stdout)=> {})
  } else {
    // Imprimir con windows
  }
})

ipcMain.on('printPreview', (e, page, width, height) => {
  let printWin = new BrowserWindow({ show: false, type:'toolbar', webPreferences: { spellcheck:false}})
  printWin.setMenu(null)
  printWin.loadURL("data:text/html;charset=utf-8," + encodeURI(page))

  printWin.webContents.on('did-finish-load', () => {
        printWin.setBounds( {width: width+20, height: height+43})
        printWin.show()
        setTimeout( ()=>{ printWin.close() }, 5000)
  })
})

ipcMain.on('saveAppConf', (e, arg) => { 
  global.APPCONF = arg
  saveConfFile(arg, CONFIG_FILE)
  logs.log('MAIN', 'SAVE_PREFS', JSON.stringify(arg))

  //Footer de ticket de impresion
  if (arg.printFooter) {
    const path = app.getPath('userData') + '/_custom/'
    const file = Buffer.from(arg.printFooter.file, 'base64');
    fs.writeFileSync(path + arg.printFooter.name, file)
  }
  restart()
})

ipcMain.on('saveInterface', (e, arg) => { 
  global.UI = arg
  saveConfFile(arg, CONFIGUI_FILE)
  logs.log('MAIN', 'SAVE_INTERFACE', JSON.stringify(arg))

  //Imagen derecha
  if (arg.rightBarImg) {
    const path = app.getPath('userData') + '/_custom/'
    const file = Buffer.from(arg.rightBarImg.file, 'base64');
    fs.writeFileSync(path + arg.rightBarImg.name, file)
  }

  //Imagen central
  if (arg.midBarImg) {
    const path = app.getPath('userData') + '/_custom/'
    const file = Buffer.from(arg.midBarImg.file, 'base64');
    fs.writeFileSync(path + arg.midBarImg.name, file)
  }
  restart()
})

ipcMain.on('saveDirDialog', (e, arg) => {
  let options
  if (arg.file) { // Abre archivo
    options = {
      title : 'Abrir archivo lista.json', 
      defaultPath : arg.dir,
      buttonLabel : "Abrir lista",
      filters : [{name: 'lista', extensions: ['json']}],
      properties: ['openFile']
    }
  } else { // Abre directorio
    options = {
      title : 'Abrir directorio', 
      defaultPath : arg.dir,
      buttonLabel : "Abrir directorio",
      properties: ['openDirectory']
    }
  }
  

  let dir = dialog.showOpenDialogSync(options)
  if (typeof dir != 'undefined')  { e.returnValue = arg.file? path.dirname( dir.toString() ) : dir.toString() }
  else                            { e.returnValue = arg.dir }
})

// Logs
var logs = new logger(`${global.APPCONF.logsDir}/`, appName)
ipcMain.on('log', (e, arg) =>       { logs.log(arg.origin, arg.event, arg.message) })
ipcMain.on('logError', (e, arg) =>  { logs.error(arg.origin, arg.error, arg.message) })


/*=====  End of IPC signals  ======*/