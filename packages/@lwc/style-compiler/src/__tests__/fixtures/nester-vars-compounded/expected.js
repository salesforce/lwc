import varResolver from "custom-properties-resolver";
function stylesheet(useActualHostSelector, token) {
  var shadowSelector = token ? ("[" + token + "]") : "";
  var hostSelector = token ? ("[" + token + "-host]") : "";
  return [".a", shadowSelector, " {box-shadow: ", varResolver("--lwc-c-active-button-box-shadow","0 0 2px " + varResolver("--lwc-brand-accessible","#0070d2")), ";}"].join('');
}
export default [stylesheet];