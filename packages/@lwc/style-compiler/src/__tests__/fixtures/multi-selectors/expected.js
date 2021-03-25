function stylesheet(hostSelector, shadowSelector, transformHost, macroSelector) {
  return [macroSelector, " h1", shadowSelector, ",", macroSelector, " h2", shadowSelector, " {}", macroSelector, " h1", shadowSelector, ",", macroSelector, " h2", shadowSelector, "{}"].join('');
}
export default [stylesheet];