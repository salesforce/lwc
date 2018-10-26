import varResolver from "custom-properties-resolver";
export default function(hostSelector, shadowSelector, nativeShadow) {
  return `
div${shadowSelector} {background: ${varResolver("--lwc-color",varResolver("--lwc-other","black"))};}
`
}
