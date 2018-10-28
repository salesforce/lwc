import varResolver from "custom-properties-resolver";
function stylesheet(hostSelector, shadowSelector) {
  return `
div${shadowSelector} {color: ${varResolver("--lwc-color")};}
div${shadowSelector} {color: ${varResolver("--lwc-color","black")};}
div${shadowSelector} {color: ${varResolver("--lwc-color")} important;}
`;
}
export default [stylesheet];