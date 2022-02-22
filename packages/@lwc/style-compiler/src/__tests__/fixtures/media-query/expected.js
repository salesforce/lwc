function stylesheet(token, useActualHostSelector, useNativeDirPseudoclass) {
  var shadowSelector = token ? ("[" + token + "]") : "";
  var hostSelector = token ? ("[" + token + "-host]") : "";
  return ["@media screen and (min-width: 900px) {h1", shadowSelector, " {}}"].join('');
  /*LWC compiler v2.9.0*/
}
export default [stylesheet];