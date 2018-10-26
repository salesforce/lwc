export default function(hostSelector, shadowSelector, realShadow) {
  let content = "";
  content += [
  "@media screen and (min-width: 900px) {h1",
  shadowSelector,
  " {}"
  ].join('');
  return content;
}
