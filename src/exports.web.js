
// Nombres de iconos de tipografia CVC Icons
const iconNames = [
  'ninguno',        // 0
  'carne',        // 1
  'pescado',      // 2
  'embutido',     // 3
  'fruta',        // 4
  'verdura',      // 5
  'pan',          // 6
  'comidas'       // 7
]

// Alias de selectores generales
var getById = document.getElementById.bind(document)
var querySel = document.querySelector.bind(document)
var querySelAll = document.querySelectorAll.bind(document)

// Otras funciones
function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)) }
function isFunction(f) {return f && {}.toString.call(f)==='[object Function]'}
function may(f,...args){try{ return f(...args)}catch{}}

/**
* Muestra un modal con multiples funciones
* @param {String} id Identificador del modal
* @param {String} template Id del template html para el contenido
* @param {Array} tplvars Selectores para rellenar texto en plantillas
* @param {String} type Tipo de modal, para estilos CSS
* @param {Function} accion Accion a realizar al pulsar el boton de aceptaar
* @param {Array} buttons Textos alternativos para botones del modal
*/
function modalBox(id, template, tplvars=[], type='', accion=false, buttons=['Cancelar','Aceptar']) {
  if ( template ) { // Añadir
    if (!document.contains( getById(id) )) {
      // Modal Fullscreen Wrapper
      let modal = document.createElement('div')
      modal.id = id; modal.className = 'modalBox ' + type

      // Modal
      let modalBox = document.createElement('div')
      let content = getById(template).content.cloneNode(true)

      // Template vars
      tplvars.forEach(item => {
        try { content.querySelector(`[data-tpl="${item[0]}"]`).innerHTML = item[1] } catch(e){}
      })

      modalBox.appendChild(content)

      // Botones
      if (accion) { 
        let btnCancel = document.createElement('button')
        btnCancel.appendChild( document.createTextNode(buttons[0]) )
        btnCancel.id = 'cancel'
        btnCancel.onclick = ()=> { modal.remove() }
    
        let btnOk = document.createElement('button')
        btnOk.appendChild( document.createTextNode(buttons[1]) )
        btnOk.id = 'ok'
        btnOk.onclick = ()=> { accion(); modal.remove() }

        modalBox.appendChild(btnOk)
        modalBox.appendChild(btnCancel)
      }

      modal.appendChild(modalBox)
      document.body.appendChild(modal)
    } else {
      tplvars.forEach(item => {
        try { getById(id).querySelector(`[data-tpl="${item[0]}"]`).textContent = item[1] } catch(e){}
      })
  }
  } else { // Si template es falso, es que se quiere destruir el modal
    try { getById(id).remove()} catch(e){}
  }
}

function urlExists(url) {
    return new Promise((resolve, reject) => {
      fetch(url).then(()=> { resolve(true)}).catch((e)=> { resolve(false) })
    })
}

function tabNav(nav, content) {
  const buttons = nav.children
  const storageItemName = `currentTab-${nav.id}`
  if ( !!!localStorage.getItem(storageItemName) ) { localStorage.setItem(storageItemName, 0) }

  for( let tab of buttons ) {
    tab.onclick = (ev)=> {
      const el = ev.currentTarget
      const tabIndex = [...el.parentNode.children].indexOf(el)
      localStorage.setItem(storageItemName, tabIndex)
      if (el.className != 'active') {
        // Buttons
        for ( let b of buttons ) { b.className = '' }
        el.className = 'active'
        // Tabs
        for ( let c of content.childNodes ) { c.className = '' }
        getById(`tab-${el.dataset.tab}`).className = 'active'
      }
    }
  }
  const initTab = parseInt( localStorage.getItem(storageItemName) )
  buttons[initTab].dispatchEvent( new Event('click') )
}


function shadeColor(color, percent) {
  var num = parseInt(color.replace("#",""),16),
  amt = Math.round(2.55 * percent),
  R = (num >> 16) + amt,
  B = (num >> 8 & 0x00FF) + amt,
  G = (num & 0x0000FF) + amt;
  return "#" + (0x1000000 + (R<255?R<1?0:R:255)*0x10000 + (B<255?B<1?0:B:255)*0x100 + (G<255?G<1?0:G:255)).toString(16).slice(1)
}


function displayGroup (group, type) {
  for ( let item of group.querySelectorAll('.visGroup') ) {
    if ( item.dataset.groups.split(',').includes(type) )  { item.style.display = '' }
    else                                                  { item.style.display = 'none' }
  }
}


/**
 * Actualiza la hora basada en el sistema y la pinta en el elemento
 */
 function updateTime(element, interval) {
  let date = new Date
  element.textContent = date.getHours().toString().padStart(2,'0') + ':' + date.getMinutes().toString().padStart(2,'0')

  setTimeout(updateTime, interval, element, interval)
}


async function readFileAsDataURL(file) {
  let result_base64 = await new Promise((resolve) => {
      let fileReader = new FileReader()
      fileReader.onload = (e) => resolve( fileReader.result )
      fileReader.readAsDataURL(file)
  })

  return result_base64;
}


export { 
  iconNames,
  sleep,
  modalBox,
  urlExists,
  isFunction,
  tabNav,
  displayGroup,
  shadeColor,
  updateTime,
  may,
  readFileAsDataURL,
  getById as $,
  querySel as $$,
  querySelAll as $$$
}