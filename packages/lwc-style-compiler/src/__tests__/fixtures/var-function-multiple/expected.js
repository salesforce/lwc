export default function(hostSelector, shadowSelector, realShadow) {
  let content = "";
  content += [
  "div",
  shadowSelector,
  " {color: ",
  varResolver("--lwc-color"),
  ",",
  varResolver("--lwc-other"),
  ";}div",
  shadowSelector,
  " {border: ",
  varResolver("--border","1px solid rgba(0,0,0,0.1)"),
  ";}div",
  shadowSelector,
  " {background: linear-gradient(to top,",
  varResolver("--lwc-color"),
  ",",
  varResolver("--lwc-other"),
  ");}"
  ].join('');
  return content;
}
