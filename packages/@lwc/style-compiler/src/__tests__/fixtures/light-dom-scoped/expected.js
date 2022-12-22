function stylesheet(token, useActualHostSelector, useNativeDirPseudoclass) {
  var shadowSelector = token ? ("." + token) : "";
  var hostSelector = token ? ("." + token + "-host") : "";
  return ((useActualHostSelector ? ":host {" : hostSelector + " {")) + "color: red;}div" + shadowSelector + " {color: green;}";
  /*LWC compiler vX.X.X*/
}
stylesheet.$scoped$ = true;
export default [stylesheet];