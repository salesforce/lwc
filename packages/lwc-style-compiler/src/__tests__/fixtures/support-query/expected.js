export default function(hostSelector, shadowSelector, realShadow) {
  let content = "";
  content += [
  "@supports (display: flex) {h1",
  shadowSelector,
  " {}"
  ].join('');
  return content;
}
