import varResolver from "custom-properties-resolver";
function stylesheet(hostSelector, shadowSelector) {
  return `
div${shadowSelector} {background: ${varResolver("--lwc-color",varResolver("--lwc-other","black"))};}
`
}
export default [
  stylesheet];