import varResolver from "custom-properties-resolver";
export default function(hostSelector, shadowSelector, nativeShadow) {
  return `
div${shadowSelector} {color: ${varResolver("--lwc-color")};}
div${shadowSelector} {color: ${varResolver("--lwc-color","black")};}
div${shadowSelector} {color: ${varResolver("--lwc-color")} important;}
`
}
