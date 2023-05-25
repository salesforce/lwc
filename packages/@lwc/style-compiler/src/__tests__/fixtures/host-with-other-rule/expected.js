function stylesheet(token, useActualHostSelector, useNativeDirPseudoclass) {
  var shadowSelector = token ? ("[" + token + "]") : "";
  var hostSelector = token ? ("[" + token + "-host]") : "";
  var suffixToken = token ? ("-" + token) : "";
  return ".red" + shadowSelector + " {color: red;}" + ((useActualHostSelector ? ":host {" : hostSelector + " {")) + "margin-left: 5px;}";
  /*LWC compiler vX.X.X*/
}
export default [stylesheet];