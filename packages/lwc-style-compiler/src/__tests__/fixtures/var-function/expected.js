export default function(hostSelector, shadowSelector, realShadow) {
  let content = "";
  content += [
  "div",
  shadowSelector,
  " {color: ",
  varResolver("--lwc-color"),
  ";}div",
  shadowSelector,
  " {color: ",
  varResolver("--lwc-color","black"),
  ";}div",
  shadowSelector,
  " {color: ",
  varResolver("--lwc-color"),
  " important;}"
  ].join('');
  return content;
}
