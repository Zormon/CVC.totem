const DEFAULT_CONFIG = { 
    logsDir: '/home/cvc/telemetry/apps',
    deployDir: '/home/cvc/deploy',
    touchScreen: true,
    server: {
      ip:'127.0.0.1',
      port: 3000,
    },
    media: {
        volume: 1,
        transitionDuration: 0.6
    },
    printer: {
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
    },
    interface: {
        info: true,
        type: 0,
        ticketAreaSize: 40,
        colas: {
          excluir: []
        },
        colors: {
          app: '#FFFFFF',
          main: '#7eb031',
          secondary: '#ffffff'
        }
    }
  }
  
exports.DEFAULT_CONFIG = DEFAULT_CONFIG