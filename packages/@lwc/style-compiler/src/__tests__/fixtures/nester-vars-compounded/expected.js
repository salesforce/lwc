import varResolver from "custom-properties-resolver";
function stylesheet(hostSelector, shadowSelector, transformHost, macroSelector) {
  return [macroSelector, " .a", shadowSelector, " {box-shadow: ", varResolver("--lwc-c-active-button-box-shadow","0 0 2px " + varResolver("--lwc-brand-accessible","#0070d2")), ";}"].join('');
}
export default [stylesheet];