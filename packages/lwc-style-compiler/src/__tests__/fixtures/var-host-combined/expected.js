import varResolver from "custom-properties-resolver";
function stylesheet(hostSelector, shadowSelector, nativeShadow) {
  return `

${nativeShadow ? (":host {color: " + varResolver("--lwc-color") + ";padding: 10px;}") : (hostSelector + " {color: " + varResolver("--lwc-color") + ";padding: 10px;}")}

${nativeShadow ? (":host(.foo) {background: linear-gradient(to top," + varResolver("--lwc-color") + "," + varResolver("--lwc-other") + ");}") : (hostSelector + ".foo {background: linear-gradient(to top," + varResolver("--lwc-color") + "," + varResolver("--lwc-other") + ");}")}
div${shadowSelector} {background: ${varResolver("--lwc-color",varResolver("--lwc-other","black"))};display: "block";}
`;
}
export default [stylesheet];