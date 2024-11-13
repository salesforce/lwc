function stylesheet() {
  var token;
  var useActualHostSelector = true;
  var useNativeDirPseudoclass = true;
  var shadowSelector = token ? ("[" + token + "]") : "";
  var hostSelector = token ? ("[" + token + "-host]") : "";
  var suffixToken = token ? ("-" + token) : "";
  return ":host-context(.foo)" + shadowSelector + " {}";
  /*LWC compiler vX.X.X*/
}
stylesheet.$nativeOnly$ = true;
export default [stylesheet];