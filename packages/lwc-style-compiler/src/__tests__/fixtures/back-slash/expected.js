export default function(hostSelector, shadowSelector, realShadow) {
  let content = "";
  content += [
  ".foo",
  shadowSelector,
  " {content: ",
  "\"\\\\\"",
  ";}"
  ].join('');
  return content;
}
