import varResolver from "custom-properties-resolver";
function stylesheet(hostSelector, shadowSelector, transformHost, macroSelector) {
  return [macroSelector, " div", shadowSelector, " {color: ", varResolver("--lwc-color"), ";}", macroSelector, " div", shadowSelector, " {color: ", varResolver("--lwc-color","black"), ";}", macroSelector, " div", shadowSelector, " {color: ", varResolver("--lwc-color"), " important;}"].join('');
}
export default [stylesheet];