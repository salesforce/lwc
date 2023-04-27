function stylesheet() {
  var token;
  var useActualHostSelector = true;
  var useNativeDirPseudoclass = true;
  var shadowSelector = token ? ("[" + token + "]") : "";
  var hostSelector = token ? ("[" + token + "-host]") : "";
  var suffixToken = token ? ("-" + token) : "";
  return ".foo" + shadowSelector + " {animation-name: fadeIn" + suffixToken + ";}@keyframes fadeIn" + suffixToken + " {0% {opacity: 0;}100% {opacity: 1;}}";
  /*LWC compiler vX.X.X*/
}
export default [stylesheet];