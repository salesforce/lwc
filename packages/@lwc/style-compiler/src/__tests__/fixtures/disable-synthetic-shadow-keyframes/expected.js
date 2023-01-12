function stylesheet() {
  var token;
  var useActualHostSelector = true;
  var useNativeDirPseudoclass = true;
  var shadowSelector = token ? ("[" + token + "]") : "";
  var hostSelector = token ? ("[" + token + "-host]") : "";
  return ".fix-notify_toast_animation" + shadowSelector + " {animation-name: fadeIn" + (shadowSelector ? ('-' + shadowSelector.substring(1, shadowSelector.length - 1)) : '') + ";animation-duration: 0.4s;}@keyframes fadeIn" + (shadowSelector ? ('-' + shadowSelector.substring(1, shadowSelector.length - 1)) : '') + " {0% {opacity: 0;}100% {opacity: 1;}}";
  /*LWC compiler vX.X.X*/
}
export default [stylesheet];