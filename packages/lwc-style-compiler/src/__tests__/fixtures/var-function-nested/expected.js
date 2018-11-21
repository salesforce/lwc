import varResolver from "custom-properties-resolver";
function stylesheet(hostSelector, shadowSelector, nativeShadow) {
  return "div" + shadowSelector + " {background: " + varResolver("--lwc-color",varResolver("--lwc-other","black")) + ";}\n";
}
export default [stylesheet];