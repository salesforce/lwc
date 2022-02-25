import varResolver from "custom-properties-resolver";
function stylesheet(token, useActualHostSelector, useNativeDirPseudoclass) {
  var shadowSelector = token ? ("[" + token + "]") : "";
  var hostSelector = token ? ("[" + token + "-host]") : "";
  return ((useActualHostSelector ? ":host {color: " + (varResolver("--lwc-color")) + ";padding: 10px;}" : hostSelector + " {color: " + (varResolver("--lwc-color")) + ";padding: 10px;}")) + ((useActualHostSelector ? ":host(.foo) {background: linear-gradient(to top," + (varResolver("--lwc-color")) + "," + (varResolver("--lwc-other")) + ");}" : hostSelector + ".foo {background: linear-gradient(to top," + (varResolver("--lwc-color")) + "," + (varResolver("--lwc-other")) + ");}")) + "div" + shadowSelector + " {background: " + (varResolver("--lwc-color",varResolver("--lwc-other","black"))) + ";display: \"block\";}";
  /*LWC compiler vX.X.X*/
}
export default [stylesheet];