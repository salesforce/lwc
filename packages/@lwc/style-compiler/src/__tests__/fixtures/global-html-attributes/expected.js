function stylesheet(hostSelector, shadowSelector, transformHost, macroSelector) {
  return [macroSelector, " [hidden]", shadowSelector, " {}", macroSelector, " [lang=\"fr\"]", shadowSelector, " {}"].join('');
}
export default [stylesheet];