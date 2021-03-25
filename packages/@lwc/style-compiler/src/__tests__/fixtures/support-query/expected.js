function stylesheet(hostSelector, shadowSelector, transformHost, macroSelector) {
  return ["@supports (display: flex) {", macroSelector, " h1", shadowSelector, " {}}"].join('');
}
export default [stylesheet];