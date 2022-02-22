import varResolver from "custom-properties-resolver";
function stylesheet(token, useActualHostSelector, useNativeDirPseudoclass) {
  var shadowSelector = token ? ("[" + token + "]") : "";
  var hostSelector = token ? ("[" + token + "-host]") : "";
  return ["@keyframes slidein", shadowSelector ? ('-' + shadowSelector.substring(1, shadowSelector.length - 1)) : '', " {from {margin-left: 100%;}to {margin-left: 0%;}}div", shadowSelector, " {color: ", varResolver("--my-var"), ";animation: 200ms slidein", shadowSelector ? ('-' + shadowSelector.substring(1, shadowSelector.length - 1)) : '', ";}span", shadowSelector, " {animation: ", varResolver("--another-var"), " slidein", shadowSelector ? ('-' + shadowSelector.substring(1, shadowSelector.length - 1)) : '', ";}p", shadowSelector, " {animation-name: slidein", shadowSelector ? ('-' + shadowSelector.substring(1, shadowSelector.length - 1)) : '', ";animation-delay: 1s;}input", shadowSelector, " {animation-name: spin;}"].join('');
  /*LWC compiler v2.9.0*/
}
export default [stylesheet];