import varResolver from "custom-properties-resolver";
function stylesheet(hostSelector, shadowSelector, nativeShadow) {
  return ["\n", (nativeShadow ? [":host {color: ", varResolver("--lwc-color"), ";padding: 10px;}"].join('') : [hostSelector, " {color: ", varResolver("--lwc-color"), ";padding: 10px;}"].join('')), "\n\n", (nativeShadow ? [":host(.foo) {background: linear-gradient(to top,", varResolver("--lwc-color"), ",", varResolver("--lwc-other"), ");}"].join('') : [hostSelector, ".foo {background: linear-gradient(to top,", varResolver("--lwc-color"), ",", varResolver("--lwc-other"), ");}"].join('')), "\ndiv", shadowSelector, " {background: ", varResolver("--lwc-color",varResolver("--lwc-other","black")), ";display: \"block\";}\n"].join('');
}
export default [stylesheet];