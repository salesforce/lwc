function stylesheet(token, useActualHostSelector, useNativeDirPseudoclass) {
  var shadowSelector = token ? ("[" + token + "]") : "";
  var hostSelector = token ? ("[" + token + "-host]") : "";
  return ["[hidden]", shadowSelector, " {}[lang=\"fr\"]", shadowSelector, " {}"].join('');
}
export default [stylesheet];