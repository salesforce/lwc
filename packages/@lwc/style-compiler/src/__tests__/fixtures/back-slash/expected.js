function stylesheet(useActualHostSelector, token) {
  var shadowSelector = token ? ("[" + token + "]") : "";
  var hostSelector = token ? ("[" + token + "-host]") : "";
  return [".foo", shadowSelector, " {content: \"\\\\\";}"].join('');
}
export default [stylesheet];