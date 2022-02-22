import varResolver from "custom-properties-resolver";
function stylesheet(token, useActualHostSelector, useNativeDirPseudoclass) {
  var shadowSelector = token ? ("[" + token + "]") : "";
  var hostSelector = token ? ("[" + token + "-host]") : "";
  return ["div", shadowSelector, " {color: ", varResolver("--lwc-color"), ";}div", shadowSelector, " {color: ", varResolver("--lwc-color","black"), ";}div", shadowSelector, " {color: ", varResolver("--lwc-color"), " important;}"].join('');
  /*LWC compiler v2.9.0*/
}
export default [stylesheet];