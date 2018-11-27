import varResolver from "custom-properties-resolver";
function stylesheet(hostSelector, shadowSelector, nativeShadow) {
  return "\n" + (nativeShadow ? (":host {color: " + varResolver("--lwc-color") + ";padding: 10px;}") : (hostSelector + " {color: " + varResolver("--lwc-color") + ";padding: 10px;}")) + "\n\n" + (nativeShadow ? (":host(.foo) {background: linear-gradient(to top," + varResolver("--lwc-color") + "," + varResolver("--lwc-other") + ");}") : (hostSelector + ".foo {background: linear-gradient(to top," + varResolver("--lwc-color") + "," + varResolver("--lwc-other") + ");}")) + "\ndiv" + shadowSelector + " {background: " + varResolver("--lwc-color",varResolver("--lwc-other","black")) + ";display: \"block\";}\n";
}
export default [stylesheet];