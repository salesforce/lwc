export default function(hostSelector, shadowSelector, realShadow) {
  let content = "";
  content += [
  "h1",
  shadowSelector,
  " {}.foo",
  shadowSelector,
  " {}[data-foo]",
  shadowSelector,
  " {}[data-foo=\"bar\"]",
  shadowSelector,
  " {}"
  ].join('');
  return content;
}
