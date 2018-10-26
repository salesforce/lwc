export default function(hostSelector, shadowSelector, realShadow) {
  let content = "";
  content += [
  "*",
  shadowSelector,
  " {}"
  ].join('');
  return content;
}
