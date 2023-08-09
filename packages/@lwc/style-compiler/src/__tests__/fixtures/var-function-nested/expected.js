function stylesheet(token, useActualHostSelector, useNativeDirPseudoclass) {
  var shadowSelector = token ? ("[" + token + "]") : "";
  var hostSelector = token ? ("[" + token + "-host]") : "";
  var suffixToken = token ? ("-" + token) : "";
  return "div" + shadowSelector + " {background: var(--lwc-color, var(--lwc-other, black));}";
  /*LWC compiler vX.X.X*/
}
export default [stylesheet];