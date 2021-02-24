import varResolver from "custom-properties-resolver";
function stylesheet(hostSelector, shadowSelector, nativeShadow) {
  return ["div", shadowSelector, " {color: ", varResolver("--lwc-color"), ",", varResolver("--lwc-other"), ";}div", shadowSelector, " {border: ", varResolver("--border","1px solid rgba(0,0,0,0.1)"), ";}div", shadowSelector, " {background: linear-gradient(to top,", varResolver("--lwc-color"), ",", varResolver("--lwc-other"), ");}"].join('');
}
export default [stylesheet];