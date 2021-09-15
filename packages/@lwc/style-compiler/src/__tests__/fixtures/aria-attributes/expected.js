function stylesheet(useActualHostSelector, token) {
  var shadowSelector = token ? ("[" + token + "]") : "";
  var hostSelector = token ? ("[" + token + "-host]") : "";
  return ["[aria-labelledby]", shadowSelector, " {}[aria-labelledby=\"bar\"]", shadowSelector, " {}"].join('');
}
export default [stylesheet];