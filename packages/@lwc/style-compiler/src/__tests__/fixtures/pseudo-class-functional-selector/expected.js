function stylesheet(token, useActualHostSelector, useNativeDirPseudoclass) {
  var shadowSelector = token ? ("[" + token + "]") : "";
  var hostSelector = token ? ("[" + token + "-host]") : "";
  return ":not(p)" + shadowSelector + " {}p:not(.foo, .bar)" + shadowSelector + " {}:matches(ol, li, span)" + shadowSelector + " {}";
  /*LWC compiler vX.X.X*/
}
export default [stylesheet];