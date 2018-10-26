export default function(hostSelector, shadowSelector, realShadow) {
  let content = "";
  content += [
  "[data-foo]",
  shadowSelector,
  " {}[data-foo=\"bar\"]",
  shadowSelector,
  " {}"
  ].join('');
  return content;
}
