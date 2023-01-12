function stylesheet(token, useActualHostSelector, useNativeDirPseudoclass) {
  var shadowSelector = token ? ("[" + token + "]") : "";
  var hostSelector = token ? ("[" + token + "-host]") : "";
  var suffixToken = token ? ("-" + token) : "";
  return "h1" + shadowSelector + " > a" + shadowSelector + " {}h1" + shadowSelector + " + a" + shadowSelector + " {}div.active" + shadowSelector + " > p" + shadowSelector + " {}";
  /*LWC compiler vX.X.X*/
}
export default [stylesheet];