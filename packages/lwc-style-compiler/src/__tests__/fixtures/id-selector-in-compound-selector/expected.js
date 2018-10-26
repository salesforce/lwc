export default function(hostSelector, shadowSelector, realShadow) {
  let content = "";
  content += [
  "#foo.active",
  shadowSelector,
  " {}"
  ].join('');
  return content;
}
