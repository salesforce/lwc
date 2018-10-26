export default function(hostSelector, shadowSelector, realShadow) {
  let content = "";
  content += [
  "input[min]",
  shadowSelector,
  " {}input[min=100]",
  shadowSelector,
  " {}"
  ].join('');
  return content;
}
