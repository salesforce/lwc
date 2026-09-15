function stylesheet(token, useActualHostSelector, useNativeDirPseudoclass) {
  var shadowSelector = token ? ("." + token) : "";
  var hostSelector = token ? ("." + token + "-host") : "";
  var suffixToken = token ? ("-" + token) : "";
  return ((useActualHostSelector ? ":host(.foo, .bar) + :host(.a, .b) {" : hostSelector + ".foo + " + hostSelector + ".a," + hostSelector + ".foo + " + hostSelector + ".b," + hostSelector + ".bar + " + hostSelector + ".a," + hostSelector + ".bar + " + hostSelector + ".b {")) + "color: red;}";
  /*LWC compiler vX.X.X*/
}
stylesheet.$scoped$ = true;
export default [stylesheet];