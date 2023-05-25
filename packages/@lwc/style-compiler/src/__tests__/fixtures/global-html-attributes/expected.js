function stylesheet(token, useActualHostSelector, useNativeDirPseudoclass) {
  var shadowSelector = token ? ("[" + token + "]") : "";
  var hostSelector = token ? ("[" + token + "-host]") : "";
  var suffixToken = token ? ("-" + token) : "";
  return "[hidden]" + shadowSelector + " {}[lang=\"fr\"]" + shadowSelector + " {}";
  /*LWC compiler vX.X.X*/
}
export default [stylesheet];