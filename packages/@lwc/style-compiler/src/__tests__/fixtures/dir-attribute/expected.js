function stylesheet(token, useActualHostSelector, useNativeDirPseudoclass) {
  var shadowSelector = token ? ("[" + token + "]") : "";
  var hostSelector = token ? ("[" + token + "-host]") : "";
  return ["[dir=\"rtl\"]", shadowSelector, " test", shadowSelector, " {order: 0;}"].join('');
}
export default [stylesheet];