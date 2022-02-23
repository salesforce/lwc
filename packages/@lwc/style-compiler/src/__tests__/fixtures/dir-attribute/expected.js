function stylesheet(token, useActualHostSelector, useNativeDirPseudoclass) {
  var shadowSelector = token ? ("[" + token + "]") : "";
  var hostSelector = token ? ("[" + token + "-host]") : "";
  return ["[dir=\"rtl\"]", shadowSelector, " test", shadowSelector, " {order: 0;}"].join('');
  /*LWC compiler vX.X.X*/
}
export default [stylesheet];