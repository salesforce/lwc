var RAPTOR_PATHS = {
    DEV: '/public/engine/engine.js',
    COMPAT: '/public/engine/engine_compat.js',
    PROD: '/public/engine/engine.min.js',
    PROD_COMPAT: '/public/engine/engine_compat.min.js',
    PROD_DEBUG: '/public/engine/engine_debug.js',
    PROD_DEBUG_COMPAT: '/public/engine/engine_compat_debug.js',
}

function parseQuery(queryString) {
  var query = {};
  var splitted = queryString.substr(1).split('&');

  for (var i = 0; i < splitted.length; i++) {
    var qs = splitted[i].split('=');
    query[decodeURIComponent(qs[0])] = decodeURIComponent(qs[1] || '');
  }

  return query;
}

var query = parseQuery(window.location.search);
var mode = query.mode || 'DEV';
var modeUrl = RAPTOR_PATHS[mode];
var isCompat = mode.toLowerCase().indexOf('compat') >= 0;
const compatPath = '/public/engine/compat.js';
const compatMinPath = '/public/engine/compat.min.js';

let helpMessage = `Raptor mode can be selected via <code>mode</code> query string (available modes: <code>${Object.keys(RAPTOR_PATHS).join('</code>, <code>')}</code>)`;
if (!modeUrl) {
    helpMessage = `<b>Please select a valid mode!</b> ` + helpMessage;
}

const help = document.createElement('div');
help.style = `position: fixed; bottom: 0; padding: 10px; background: #ddd; width: 100%; left: 0;`;
help.innerHTML = helpMessage;
document.body.appendChild(help);

if (isCompat) {
    document.write('<script src="' + compatPath + '"></script>');
}
document.write('<script src="' + modeUrl + '"></script>');

const appScript = document.querySelector('#raptor-app');
const appUrl = isCompat ?
    appScript.dataset.src.replace('.js', '_compat.js') :
    appScript.dataset.src;

document.write('<script src="' + appUrl + '"></script>');
