function stylesheet(hostSelector, shadowSelector, transformHost, macroSelector) {
  return [macroSelector, " :checked", shadowSelector, " {}", macroSelector, " ul", shadowSelector, " li:first-child", shadowSelector, " a", shadowSelector, " {}"].join('');
}
export default [stylesheet];