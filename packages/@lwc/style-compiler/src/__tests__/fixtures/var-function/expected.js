function stylesheet(token, useActualHostSelector, useNativeDirPseudoclass) {
  var shadowSelector = token ? ("[" + token + "]") : "";
  var hostSelector = token ? ("[" + token + "-host]") : "";
  var suffixToken = token ? ("-" + token) : "";
  return "div" + shadowSelector + " {color: var(--lwc-color);}div" + shadowSelector + " {color: var(--lwc-color, black);}div" + shadowSelector + " {color: var(--lwc-color) important;}";
  /*LWC compiler vX.X.X*/
}
export default [stylesheet];