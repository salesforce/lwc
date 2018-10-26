export default function(hostSelector, shadowSelector, realShadow) {
  let content = "";
  content += [
  "h1",
  shadowSelector,
  ", h2",
  shadowSelector,
  " {}h1",
  shadowSelector,
  ",\nh2",
  shadowSelector,
  "\n{}"
  ].join('');
  return content;
}
