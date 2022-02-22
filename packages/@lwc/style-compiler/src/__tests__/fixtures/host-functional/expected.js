function stylesheet(token, useActualHostSelector, useNativeDirPseudoclass) {
  var shadowSelector = token ? ("[" + token + "]") : "";
  var hostSelector = token ? ("[" + token + "-host]") : "";
  return [(useActualHostSelector ? ":host(.foo) {}" : [hostSelector, ".foo {}"].join('')), (useActualHostSelector ? [":host(.foo) span", shadowSelector, " {}"].join('') : [hostSelector, ".foo span", shadowSelector, " {}"].join('')), (useActualHostSelector ? ":host(:hover) {}" : [hostSelector, ":hover {}"].join('')), (useActualHostSelector ? ":host(.foo, .bar) {}" : [hostSelector, ".foo,", hostSelector, ".bar {}"].join(''))].join('');
  /*LWC compiler v2.9.0*/
}
export default [stylesheet];