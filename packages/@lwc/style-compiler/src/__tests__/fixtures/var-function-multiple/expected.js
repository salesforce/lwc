import varResolver from "custom-properties-resolver";
function stylesheet(hostSelector, shadowSelector, nativeShadow) {
  return "div" + shadowSelector + " {color: " + varResolver("--lwc-color") + "," + varResolver("--lwc-other") + ";}\ndiv" + shadowSelector + " {border: " + varResolver("--border","1px solid rgba(0,0,0,0.1)") + ";}\ndiv" + shadowSelector + " {background: linear-gradient(to top," + varResolver("--lwc-color") + "," + varResolver("--lwc-other") + ");}\n";
}
export default [stylesheet];