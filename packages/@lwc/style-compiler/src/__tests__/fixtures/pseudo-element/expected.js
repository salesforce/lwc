function stylesheet(token, useActualHostSelector, useNativeDirPseudoclass) {
  var shadowSelector = token ? ("[" + token + "]") : "";
  var hostSelector = token ? ("[" + token + "-host]") : "";
  return [shadowSelector, "::after {}h1", shadowSelector, "::before {}"].join('');
  /*LWC compiler v2.9.0*/
}
export default [stylesheet];