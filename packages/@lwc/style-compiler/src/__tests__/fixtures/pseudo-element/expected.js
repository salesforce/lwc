function stylesheet(token, useActualHostSelector, useNativeDirPseudoclass) {
  var shadowSelector = token ? ("[" + token + "]") : "";
  var hostSelector = token ? ("[" + token + "-host]") : "";
  var suffixToken = token ? ("-" + token) : "";
  return shadowSelector + "::after {}h1" + shadowSelector + "::before {}*" + shadowSelector + ", *" + shadowSelector + "::before {}*" + shadowSelector + ", " + shadowSelector + "::before {}*" + shadowSelector + ", " + shadowSelector + ":before {}*" + shadowSelector + ", .ancestor" + shadowSelector + " " + shadowSelector + "::before {}*" + shadowSelector + "," + shadowSelector + "::before {}";
  /*LWC compiler vX.X.X*/
}
export default [stylesheet];