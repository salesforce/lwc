function stylesheet(token, useActualHostSelector, useNativeDirPseudoclass) {
  var shadowSelector = token ? ("[" + token + "]") : "";
  var hostSelector = token ? ("[" + token + "-host]") : "";
  var suffixToken = token ? ("-" + token) : "";
  return ((useActualHostSelector ? ":host {" : hostSelector + " {")) + "color: var(--lwc-color);padding: 10px;}" + ((useActualHostSelector ? ":host(.foo) {" : hostSelector + ".foo {")) + "background: linear-gradient(to top, var(--lwc-color), var(--lwc-other));}div" + shadowSelector + " {background: var(--lwc-color, var(--lwc-other, black));display: \"block\";}";
  /*LWC compiler vX.X.X*/
}
export default [stylesheet];