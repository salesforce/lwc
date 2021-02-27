import varResolver from "custom-properties-resolver";
function stylesheet(hostSelector, shadowSelector, nativeShadow) {
  return ["div", shadowSelector, " {color: ", varResolver("--lwc-color"), ";}div", shadowSelector, " {color: ", varResolver("--lwc-color","black"), ";}div", shadowSelector, " {color: ", varResolver("--lwc-color"), " important;}"].join('');
}
export default [stylesheet];