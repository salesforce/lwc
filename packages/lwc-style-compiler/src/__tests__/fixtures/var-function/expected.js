import varResolver from "custom-properties-resolver";
function stylesheet(hostSelector, shadowSelector, nativeShadow) {
  return "div" + shadowSelector + " {color: " + varResolver("--lwc-color") + ";}\ndiv" + shadowSelector + " {color: " + varResolver("--lwc-color","black") + ";}\ndiv" + shadowSelector + " {color: " + varResolver("--lwc-color") + " important;}\n";
}
export default [stylesheet];