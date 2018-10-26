import varResolver from "custom-properties-resolver";
export default function(hostSelector, shadowSelector, realShadow) {
  let content = "";
  content += [
  "div",
  shadowSelector,
  " {background: ",
  varResolver("--lwc-color",varResolver("--lwc-other","black")),
  ";}"
  ].join('');
  return content;
}
