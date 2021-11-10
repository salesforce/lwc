function stylesheet(useActualHostSelector, token) {
  var shadowSelector = token ? ("[" + token + "]") : "";
  var hostSelector = token ? ("[" + token + "-host]") : "";
  return ["h1", shadowSelector, " > a", shadowSelector, " {}h1", shadowSelector, " + a", shadowSelector, " {}div.active", shadowSelector, " > p", shadowSelector, " {}"].join('');
}
export default [stylesheet];