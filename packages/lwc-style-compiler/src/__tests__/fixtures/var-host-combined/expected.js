import varResolver from "custom-properties-resolver";
function stylesheet(hostSelector, shadowSelector, nativeShadow) {
  return `
${nativeShadow ? (":host {color: " + varResolver("--lwc-color") + ";padding: 10px;}") : ''}
${hostSelector} {color: ${varResolver("--lwc-color")};padding: 10px;}
div${shadowSelector} {background: ${varResolver("--lwc-color",varResolver("--lwc-other","black"))};display: "block";}
`;
}
export default [stylesheet];