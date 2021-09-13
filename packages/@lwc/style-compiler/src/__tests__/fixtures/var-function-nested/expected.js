import varResolver from "custom-properties-resolver";
function stylesheet(useActualHostSelector, token) {
  var shadowSelector = token ? ("[" + token + "]") : "";
  var hostSelector = token ? ("[" + token + "-host]") : "";
  return ["div", shadowSelector, " {background: ", varResolver("--lwc-color",varResolver("--lwc-other","black")), ";}"].join('');
}
export default [stylesheet];