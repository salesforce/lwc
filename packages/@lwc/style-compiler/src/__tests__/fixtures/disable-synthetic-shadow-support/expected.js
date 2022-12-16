function stylesheet() {
  var token;
  var useActualHostSelector = true;
  var useNativeDirPseudoclass = true;
  var shadowSelector = token ? ("[" + token + "]") : "";
  var hostSelector = token ? ("[" + token + "-host]") : "";
  return ((useActualHostSelector ? (useNativeDirPseudoclass ? '' : '[dir="rtl"]') + " :host(.foo) " + (useNativeDirPseudoclass ? ':dir(rtl)' : '') + " {}" : (useNativeDirPseudoclass ? '' : '[dir="rtl"]') + " " + hostSelector + ".foo " + (useNativeDirPseudoclass ? ':dir(rtl)' : '') + " {}"));
  /*LWC compiler vX.X.X*/
}
export default [stylesheet];