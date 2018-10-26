export default function(hostSelector, shadowSelector, realShadow) {
  let content = "";
  content += [
  "[hidden]",
  shadowSelector,
  " {}[lang=\"fr\"]",
  shadowSelector,
  " {}"
  ].join('');
  return content;
}
