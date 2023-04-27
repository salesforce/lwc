function stylesheet(token, useActualHostSelector, useNativeDirPseudoclass) {
  var shadowSelector = token ? ("[" + token + "]") : "";
  var hostSelector = token ? ("[" + token + "-host]") : "";
  var suffixToken = token ? ("-" + token) : "";
  return ":checked" + shadowSelector + " {}ul" + shadowSelector + " li:first-child" + shadowSelector + " a" + shadowSelector + " {}";
  /*LWC compiler vX.X.X*/
}
export default [stylesheet];