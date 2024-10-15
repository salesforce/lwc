function stylesheet(token, useActualHostSelector, useNativeDirPseudoclass) {
  var shadowSelector = token ? ("[" + token + "]") : "";
  var hostSelector = token ? ("[" + token + "-host]") : "";
  var suffixToken = token ? ("-" + token) : "";
  return (useNativeDirPseudoclass ? '' : '[dir="ltr"]') + " " + (useNativeDirPseudoclass ? ':dir(ltr)' : '') + " {order: 0;}" + (useNativeDirPseudoclass ? '' : '[dir="ltr"]') + " " + (useNativeDirPseudoclass ? ':dir(ltr)' : '') + " test" + shadowSelector + " {order: 1;}" + (useNativeDirPseudoclass ? '' : '[dir="ltr"]') + " test" + shadowSelector + " " + (useNativeDirPseudoclass ? ':dir(ltr)' : '') + " {order: 2;}" + (useNativeDirPseudoclass ? '' : '[dir="ltr"]') + " test" + (useNativeDirPseudoclass ? ':dir(ltr)' : '') + shadowSelector + " {order: 3;}" + (useNativeDirPseudoclass ? '' : '[dir="ltr"]') + " test" + (useNativeDirPseudoclass ? ':dir(ltr)' : '') + shadowSelector + " test" + shadowSelector + " {order: 4;}" + (useNativeDirPseudoclass ? '' : '[dir="rtl"]') + " " + (useNativeDirPseudoclass ? ':dir(rtl)' : '') + " {order: 5;}" + (useNativeDirPseudoclass ? '' : '[dir="rtl"]') + " " + (useNativeDirPseudoclass ? ':dir(rtl)' : '') + " test" + shadowSelector + " {order: 6;}" + (useNativeDirPseudoclass ? '' : '[dir="rtl"]') + " test" + shadowSelector + " " + (useNativeDirPseudoclass ? ':dir(rtl)' : '') + " {order: 7;}" + (useNativeDirPseudoclass ? '' : '[dir="rtl"]') + " test" + (useNativeDirPseudoclass ? ':dir(rtl)' : '') + shadowSelector + " {order: 8;}" + (useNativeDirPseudoclass ? '' : '[dir="rtl"]') + " test" + (useNativeDirPseudoclass ? ':dir(rtl)' : '') + shadowSelector + " test" + shadowSelector + " {order: 9;}";
  /*@preserve LWC compiler vX.X.X*/
}
export default [stylesheet];