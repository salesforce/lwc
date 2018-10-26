export default function(hostSelector, shadowSelector, realShadow) {
  let content = "";
  content += [
  "#foo",
  shadowSelector,
  " {}"
  ].join('');
  return content;
}
