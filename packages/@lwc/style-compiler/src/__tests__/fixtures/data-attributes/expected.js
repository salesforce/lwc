function stylesheet(hostSelector, shadowSelector, transformHost, macroSelector) {
  return [macroSelector, " [data-foo]", shadowSelector, " {}", macroSelector, " [data-foo=\"bar\"]", shadowSelector, " {}"].join('');
}
export default [stylesheet];