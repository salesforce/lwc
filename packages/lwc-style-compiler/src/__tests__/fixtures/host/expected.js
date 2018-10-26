export default function(hostSelector, shadowSelector, realShadow) {
  let content = "";
  content += [
  realShadow ? (":host {}") : '',
  hostSelector,
  " {}"
  ].join('');
  return content;
}
