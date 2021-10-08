function stylesheet(token, useActualHostSelector, useNativeDirPseudoclass) {
  var shadowSelector = token ? ("[" + token + "]") : "";
  var hostSelector = token ? ("[" + token + "-host]") : "";
  return [":checked", shadowSelector, " {}ul", shadowSelector, " li:first-child", shadowSelector, " a", shadowSelector, " {}"].join('');
}
export default [stylesheet];