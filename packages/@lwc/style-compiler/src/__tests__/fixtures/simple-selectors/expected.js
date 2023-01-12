function stylesheet(token, useActualHostSelector, useNativeDirPseudoclass) {
  var shadowSelector = token ? ("[" + token + "]") : "";
  var hostSelector = token ? ("[" + token + "-host]") : "";
  var suffixToken = token ? ("-" + token) : "";
  return "h1" + shadowSelector + " {}.foo" + shadowSelector + " {}[data-foo]" + shadowSelector + " {}[data-foo=\"bar\"]" + shadowSelector + " {}";
  /*LWC compiler vX.X.X*/
}
export default [stylesheet];