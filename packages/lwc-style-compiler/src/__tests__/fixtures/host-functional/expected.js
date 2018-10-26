export default function(hostSelector, shadowSelector, realShadow) {
  let content = "";
  content += [
  realShadow ? (":host(.foo) {}") : '',
  hostSelector,
  ".foo {}",
  realShadow ? (":host(.foo) span" + shadowSelector + " {}") : '',
  hostSelector,
  ".foo span",
  shadowSelector,
  " {}",
  realShadow ? (":host(:hover) {}") : '',
  hostSelector,
  ":hover {}",
  realShadow ? (":host(.foo, .bar) {}") : '',
  hostSelector,
  ".foo,",
  hostSelector,
  ".bar {}"
  ].join('');
  return content;
}
