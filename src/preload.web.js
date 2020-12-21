function $(id)      { return document.getElementById(id)    }
function $$(id)     { return document.querySelector(id)     }
function $$$(id)    { return document.querySelectorAll(id)  }
function sleep(ms)  { return new Promise(r => setTimeout(r, ms)) }
function isFunction(f) {return f && {}.toString.call(f)==='[object Function]'}