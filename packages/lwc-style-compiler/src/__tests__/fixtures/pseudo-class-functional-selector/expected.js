export default function(hostSelector, shadowSelector, realShadow) {
  let content = "";
  content += [
  ":not(p)",
  shadowSelector,
  " {}p:not(.foo, .bar)",
  shadowSelector,
  " {}:matches(ol, li, span)",
  shadowSelector,
  " {}"
  ].join('');
  return content;
}
