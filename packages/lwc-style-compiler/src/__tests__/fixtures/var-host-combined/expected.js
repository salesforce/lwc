import varResolver from "custom-properties-resolver";
export default function(hostSelector, shadowSelector, realShadow) {
  let content = "";
  content += [
  realShadow ? (":host {color: " + varResolver("--lwc-color") + ";padding: 10px;}") : '',
  hostSelector,
  " {color: ",
  varResolver("--lwc-color"),
  ";padding: 10px;}div",
  shadowSelector,
  " {background: ",
  varResolver("--lwc-color",varResolver("--lwc-other","black")),
  ";display: ",
  "\"block\"",
  ";}h1",
  shadowSelector,
  ":before {content: ",
  "'test\"escaping quote(\\')'",
  ";}h1",
  shadowSelector,
  ":after {content: ",
  "\"test'escaping quote(\\\")\"",
  ";}"
  ].join('');
  return content;
}
