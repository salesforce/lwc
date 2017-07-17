var RAPTOR_PATHS = {
    DEV: '/node_modules/raptor-engine/dist/engine.js',
    COMPAT: '/node_modules/raptor-engine/dist/engine_compat.js',
    PROD: '/node_modules/raptor-engine/dist/engine.min.js',
    PROD_COMPAT: '/node_modules/raptor-engine/dist/engine_compat.min.js',
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

let helpMessage = `Raptor mode can be selected via <code>mode</code> query string (available modes: <code>${Object.keys(RAPTOR_PATHS).join('</code>, <code>')}</code>)`;
if (!modeUrl) {
    helpMessage = `<b>Please select a valid mode!</b> ` + helpMessage;
}

const help = document.createElement('div');
help.style = `position: absolute; bottom: 0; padding: 10px; background: #ddd; width: 100%; left: 0;`;
help.innerHTML = helpMessage;
document.body.appendChild(help);

document.write('<script src="' + modeUrl + '"></script>');

const appScript = document.querySelector('#raptor-app');
const appUrl = isCompat ?
    appScript.dataset.src.replace('.js', '_compat.js') :
    appScript.dataset.src;

document.write('<script src="' + appUrl + '"></script>');
