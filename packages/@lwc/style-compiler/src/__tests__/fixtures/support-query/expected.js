function stylesheet(token, useActualHostSelector, useNativeDirPseudoclass) {
  var shadowSelector = token ? ("[" + token + "]") : "";
  var hostSelector = token ? ("[" + token + "-host]") : "";
  return ["@supports (display: flex) {h1", shadowSelector, " {}}"].join('');
}
export default [stylesheet];