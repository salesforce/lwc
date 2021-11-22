import varResolver from "custom-properties-resolver";
function stylesheet(token, useActualHostSelector, useNativeDirPseudoclass) {
  var shadowSelector = token ? ("[" + token + "]") : "";
  var hostSelector = token ? ("[" + token + "-host]") : "";
  return [(useActualHostSelector ? [":host {color: ", varResolver("--lwc-color"), ";padding: 10px;}"].join('') : [hostSelector, " {color: ", varResolver("--lwc-color"), ";padding: 10px;}"].join('')), (useActualHostSelector ? [":host(.foo) {background: linear-gradient(to top,", varResolver("--lwc-color"), ",", varResolver("--lwc-other"), ");}"].join('') : [hostSelector, ".foo {background: linear-gradient(to top,", varResolver("--lwc-color"), ",", varResolver("--lwc-other"), ");}"].join('')), "div", shadowSelector, " {background: ", varResolver("--lwc-color",varResolver("--lwc-other","black")), ";display: \"block\";}"].join('');
}
export default [stylesheet];