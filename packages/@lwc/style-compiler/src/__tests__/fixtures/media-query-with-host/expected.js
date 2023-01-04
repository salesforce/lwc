function stylesheet(token, useActualHostSelector, useNativeDirPseudoclass) {
  var shadowSelector = token ? ("[" + token + "]") : "";
  var hostSelector = token ? ("[" + token + "-host]") : "";
  return "@media screen and (max-width: 768px) {" + ((useActualHostSelector ? ":host {" : hostSelector + " {")) + "width: calc(50% - 1rem);}}";
  /*LWC compiler vX.X.X*/
}
export default [stylesheet];