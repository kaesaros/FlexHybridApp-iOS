!function(e){var o={};function r(n){if(o[n])return o[n].exports;var t=o[n]={i:n,l:!1,exports:{}};return e[n].call(t.exports,t,t.exports,r),t.l=!0,t.exports}r.m=e,r.c=o,r.d=function(e,o,n){r.o(e,o)||Object.defineProperty(e,o,{enumerable:!0,get:n})},r.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},r.t=function(e,o){if(1&o&&(e=r(e)),8&o)return e;if(4&o&&"object"==typeof e&&e&&e.__esModule)return e;var n=Object.create(null);if(r.r(n),Object.defineProperty(n,"default",{enumerable:!0,value:e}),2&o&&"string"!=typeof e)for(var t in e)r.d(n,t,function(o){return e[o]}.bind(null,t));return n},r.n=function(e){var o=e&&e.__esModule?function(){return e.default}:function(){return e};return r.d(o,"a",o),o},r.o=function(e,o){return Object.prototype.hasOwnProperty.call(e,o)},r.p="",r(r.s=0)}([function(e,o){!function(){"use strict";const e=keysfromios,o=optionsfromios,r=deviceinfofromios,n=[],t={log:console.log,debug:console.debug,error:console.error,info:console.info},l={timeout:6e4},i=()=>{const e="f"+Math.random().toString(10).substr(2,8);return void 0===window[e]?Promise.resolve(e):Promise.resolve(i())},u=(e,o)=>{n.forEach(r=>{r.e===e&&"function"==typeof r.c&&r.c(o)})},f=(...e)=>{const o=[];return e.forEach(e=>{o.push(String(e))}),o};Object.keys(o).forEach(e=>{"timeout"===e&&"number"==typeof o[e]&&Object.defineProperty(l,e,{value:o[e],writable:!1,enumerable:!0})}),Object.defineProperty(window,"$flex",{value:{},writable:!1,enumerable:!0}),Object.defineProperties($flex,{version:{value:"0.3.9.5",writable:!1,enumerable:!0},isAndroid:{value:!1,writable:!1,enumerable:!0},isiOS:{value:!0,writable:!1,enumerable:!0},device:{value:r,writable:!1,enumerable:!0},addEventListener:{value:function(e,o){n.push({e:e,c:o})},writable:!1,enumerable:!0},web:{value:{},writable:!1,enumerable:!0},options:{value:l,writable:!1,enumerable:!0},flex:{value:{},writable:!1,enumerable:!1}}),e.forEach(e=>{void 0===$flex[e]&&Object.defineProperty($flex,e,{value:function(...o){return new Promise((r,n)=>{i().then(t=>{const i=setTimeout(()=>{$flex.flex[t](!1,"timeout error"),u("timeout",{function:e})},l.timeout);$flex.flex[t]=(o,l,f)=>{if(clearTimeout(i),delete $flex.flex[t],o)r(f);else{let o;o="string"==typeof l?Error(l):Error("$flex Error occurred in function -- $flex."+e),n(o),u("error",{function:e,err:o})}};try{webkit.messageHandlers[e].postMessage({funName:t,arguments:o})}catch(r){"DataCloneError"!==r.name||"flexlog"!==e&&"flexdebug"!==e&&"flexerror"!==e&&"flexinfo"!==e?$flex.flex[t](!1,r.toString()):webkit.messageHandlers[e].postMessage({funName:t,arguments:f(...o)})}})})},writable:!1,enumerable:!1})}),console.log=function(...e){$flex.flexlog(...e),t.log(...e)},console.debug=function(...e){$flex.flexdebug(...e),t.debug(...e)},console.error=function(...e){$flex.flexerror(...e),t.error(...e)},console.info=function(...e){$flex.flexinfo(...e),t.info(...e)},setTimeout(()=>{let e=()=>{};"function"==typeof window.onFlexLoad&&(e=window.onFlexLoad),Object.defineProperty(window,"onFlexLoad",{set:function(e){window._onFlexLoad=e,"function"==typeof e&&e()},get:function(){return window._onFlexLoad}}),window.onFlexLoad=e},0)}()}]);
