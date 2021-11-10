function stylesheet(token, useActualHostSelector, useNativeDirPseudoclass) {
  var shadowSelector = token ? ("[" + token + "]") : "";
  var hostSelector = token ? ("[" + token + "-host]") : "";
  return (useActualHostSelector ? ":host {}" : [hostSelector, " {}"].join(''));
}
export default [stylesheet];