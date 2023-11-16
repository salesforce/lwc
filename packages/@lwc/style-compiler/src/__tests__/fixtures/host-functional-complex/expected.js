function stylesheet(token, useActualHostSelector, useNativeDirPseudoclass) {
  var shadowSelector = token ? ("[" + token + "]") : "";
  var hostSelector = token ? ("[" + token + "-host]") : "";
  var suffixToken = token ? ("-" + token) : "";
  return ((useActualHostSelector ? ":host(.foo, .bar) .baz" : hostSelector + ".foo .baz" + shadowSelector + " .quux" + shadowSelector + "," + hostSelector + ".bar .baz")) + shadowSelector + " .quux" + shadowSelector + " {color: black;}";
  /*LWC compiler vX.X.X*/
}
export default [stylesheet];