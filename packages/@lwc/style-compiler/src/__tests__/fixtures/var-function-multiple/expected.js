import varResolver from "custom-properties-resolver";
function stylesheet(hostSelector, shadowSelector, transformHost, macroSelector) {
  return [macroSelector, " div", shadowSelector, " {color: ", varResolver("--lwc-color"), ",", varResolver("--lwc-other"), ";}", macroSelector, " div", shadowSelector, " {border: ", varResolver("--border","1px solid rgba(0,0,0,0.1)"), ";}", macroSelector, " div", shadowSelector, " {background: linear-gradient(to top,", varResolver("--lwc-color"), ",", varResolver("--lwc-other"), ");}"].join('');
}
export default [stylesheet];