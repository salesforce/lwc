export default function(hostSelector, shadowSelector, realShadow) {
  let content = "";
  content += [
  shadowSelector,
  "::after {}h1",
  shadowSelector,
  "::before {}"
  ].join('');
  return content;
}
