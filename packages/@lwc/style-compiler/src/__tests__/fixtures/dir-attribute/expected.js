function stylesheet(token, useActualHostSelector, useNativeDirPseudoclass) {
  var shadowSelector = token ? ("[" + token + "]") : "";
  var hostSelector = token ? ("[" + token + "-host]") : "";
  var suffixToken = token ? ("-" + token) : "";
  return "[dir=\"rtl\"]" + shadowSelector + " test" + shadowSelector + " {order: 0;}";
  /*@preserve LWC compiler vX.X.X*/
}
export default [stylesheet];