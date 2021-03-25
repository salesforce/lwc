function stylesheet(hostSelector, shadowSelector, transformHost, macroSelector) {
  return [macroSelector, " h1", shadowSelector, " > a", shadowSelector, " {}", macroSelector, " h1", shadowSelector, " + a", shadowSelector, " {}", macroSelector, " div.active", shadowSelector, " > p", shadowSelector, " {}"].join('');
}
export default [stylesheet];