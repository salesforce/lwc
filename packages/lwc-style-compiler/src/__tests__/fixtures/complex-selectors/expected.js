export default function(hostSelector, shadowSelector, realShadow) {
  let content = "";
  content += [
  "h1",
  shadowSelector,
  " > a",
  shadowSelector,
  " {}h1",
  shadowSelector,
  " + a",
  shadowSelector,
  " {}div.active",
  shadowSelector,
  " > p",
  shadowSelector,
  " {}"
  ].join('');
  return content;
}
