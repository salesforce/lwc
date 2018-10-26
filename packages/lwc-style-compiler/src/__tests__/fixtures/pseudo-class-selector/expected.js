export default function(hostSelector, shadowSelector, realShadow) {
  let content = "";
  content += [
  ":checked",
  shadowSelector,
  " {}ul",
  shadowSelector,
  " li:first-child",
  shadowSelector,
  " a",
  shadowSelector,
  " {}"
  ].join('');
  return content;
}
