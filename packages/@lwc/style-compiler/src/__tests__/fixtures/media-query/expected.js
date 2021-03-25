function stylesheet(hostSelector, shadowSelector, transformHost, macroSelector) {
  return ["@media screen and (min-width: 900px) {", macroSelector, " h1", shadowSelector, " {}}"].join('');
}
export default [stylesheet];