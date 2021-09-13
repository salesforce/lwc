function stylesheet(useActualHostSelector, token) {
  var shadowSelector = token ? ("[" + token + "]") : "";
  var hostSelector = token ? ("[" + token + "-host]") : "";
  return ["[hidden]", shadowSelector, " {}[lang=\"fr\"]", shadowSelector, " {}"].join('');
}
export default [stylesheet];