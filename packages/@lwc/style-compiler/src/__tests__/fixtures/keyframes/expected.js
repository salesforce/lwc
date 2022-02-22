function stylesheet(token, useActualHostSelector, useNativeDirPseudoclass) {
  var shadowSelector = token ? ("[" + token + "]") : "";
  var hostSelector = token ? ("[" + token + "-host]") : "";
  return ["@keyframes slidein", shadowSelector ? ('-' + shadowSelector.substring(1, shadowSelector.length - 1)) : '', " {from {margin-left: 100%;}to {margin-left: 0%;}}div", shadowSelector, " {animation: 3s ease-in 1s 2 reverse both paused slidein", shadowSelector ? ('-' + shadowSelector.substring(1, shadowSelector.length - 1)) : '', ";}span", shadowSelector, " {-webkit-animation: 3s ease-in 1s 2 reverse both paused slidein", shadowSelector ? ('-' + shadowSelector.substring(1, shadowSelector.length - 1)) : '', ";-moz-animation: 3s ease-in 1s 2 reverse both paused slidein", shadowSelector ? ('-' + shadowSelector.substring(1, shadowSelector.length - 1)) : '', ";animation: slidein", shadowSelector ? ('-' + shadowSelector.substring(1, shadowSelector.length - 1)) : '', " 3s;}button", shadowSelector, " {animation: spin 1s;}p", shadowSelector, " {-webkit-animation-name: slidein", shadowSelector ? ('-' + shadowSelector.substring(1, shadowSelector.length - 1)) : '', ";-moz-animation-name: slidein", shadowSelector ? ('-' + shadowSelector.substring(1, shadowSelector.length - 1)) : '', ";animation-name: slidein", shadowSelector ? ('-' + shadowSelector.substring(1, shadowSelector.length - 1)) : '', ";-webkit-animation-delay: 1s;-moz-animation-delay: 1s;animation-delay: 1s;}input", shadowSelector, " {animation-name: spin;}form", shadowSelector, " {animation: 2s linear 1s reverse slidein", shadowSelector ? ('-' + shadowSelector.substring(1, shadowSelector.length - 1)) : '', "}"].join('');
  /*LWC compiler v2.9.0*/
}
export default [stylesheet];