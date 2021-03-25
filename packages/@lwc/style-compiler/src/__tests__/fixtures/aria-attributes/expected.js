function stylesheet(hostSelector, shadowSelector, transformHost, macroSelector) {
  return [macroSelector, " [aria-labelledby]", shadowSelector, " {}", macroSelector, " [aria-labelledby=\"bar\"]", shadowSelector, " {}"].join('');
}
export default [stylesheet];