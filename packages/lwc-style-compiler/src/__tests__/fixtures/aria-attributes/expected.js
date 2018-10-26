export default function(hostSelector, shadowSelector, realShadow) {
  let content = "";
  content += [
  "[aria-labelledby]",
  shadowSelector,
  " {}[aria-labelledby=\"bar\"]",
  shadowSelector,
  " {}"
  ].join('');
  return content;
}
