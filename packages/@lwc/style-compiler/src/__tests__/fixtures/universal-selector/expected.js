function stylesheet(token, useActualHostSelector, useNativeDirPseudoclass) {
  var shadowSelector = token ? ("[" + token + "]") : "";
  var hostSelector = token ? ("[" + token + "-host]") : "";
  return ["*", shadowSelector, " {}"].join('');
  /*LWC compiler vX.X.X*/
}
export default [stylesheet];