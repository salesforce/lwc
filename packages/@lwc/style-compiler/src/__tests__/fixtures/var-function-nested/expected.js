import varResolver from "custom-properties-resolver";
function stylesheet(hostSelector, shadowSelector, transformHost, macroSelector) {
  return [macroSelector, " div", shadowSelector, " {background: ", varResolver("--lwc-color",varResolver("--lwc-other","black")), ";}"].join('');
}
export default [stylesheet];