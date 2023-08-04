function stylesheet(token, useActualHostSelector, useNativeDirPseudoclass) {
  var shadowSelector = token ? ("[" + token + "]") : "";
  var hostSelector = token ? ("[" + token + "-host]") : "";
  var suffixToken = token ? ("-" + token) : "";
  return ".a" + shadowSelector + " {box-shadow: var(--lwc-c-active-button-box-shadow, 0 0 2px var(--lwc-brand-accessible, #0070d2));}";
  /*LWC compiler vX.X.X*/
}
export default [stylesheet];