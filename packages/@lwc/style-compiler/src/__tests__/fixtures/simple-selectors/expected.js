function stylesheet(hostSelector, shadowSelector, transformHost, macroSelector) {
  return [macroSelector, " h1", shadowSelector, " {}", macroSelector, " .foo", shadowSelector, " {}", macroSelector, " [data-foo]", shadowSelector, " {}", macroSelector, " [data-foo=\"bar\"]", shadowSelector, " {}"].join('');
}
export default [stylesheet];