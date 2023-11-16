function stylesheet(token, useActualHostSelector, useNativeDirPseudoclass) {
  var shadowSelector = token ? ("[" + token + "]") : "";
  var hostSelector = token ? ("[" + token + "-host]") : "";
  var suffixToken = token ? ("-" + token) : "";
  return "div" + shadowSelector + " {color: var(--lwc-color), var(--lwc-other);}div" + shadowSelector + " {border: var(--border, 1px solid rgba(0, 0, 0, 0.1));}div" + shadowSelector + " {background: linear-gradient(to top, var(--lwc-color), var(--lwc-other));}";
  /*LWC compiler vX.X.X*/
}
export default [stylesheet];