function stylesheet(useActualHostSelector, token) {
  var shadowSelector = token ? ("[" + token + "]") : "";
  var hostSelector = token ? ("[" + token + "-host]") : "";
  return [shadowSelector, "::after {}h1", shadowSelector, "::before {}"].join('');
}
export default [stylesheet];