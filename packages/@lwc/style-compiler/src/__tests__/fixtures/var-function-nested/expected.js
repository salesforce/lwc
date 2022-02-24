import varResolver from "custom-properties-resolver";
function stylesheet(token, useActualHostSelector, useNativeDirPseudoclass) {
  var shadowSelector = token ? ("[" + token + "]") : "";
  var hostSelector = token ? ("[" + token + "-host]") : "";
  return "div" + shadowSelector + " {background: " + (varResolver("--lwc-color",varResolver("--lwc-other","black"))) + ";}";
  /*LWC compiler vX.X.X*/
}
export default [stylesheet];