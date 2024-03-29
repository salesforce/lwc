function stylesheet(token, useActualHostSelector, useNativeDirPseudoclass) {
  var shadowSelector = token ? ("[" + token + "]") : "";
  var hostSelector = token ? ("[" + token + "-host]") : "";
  var suffixToken = token ? ("-" + token) : "";
  return "[data-foo=\"</style><script>alert('pwned!')</script>\"]" + shadowSelector + " {color: red;}";
  /*LWC compiler vX.X.X*/
}
export default [stylesheet];