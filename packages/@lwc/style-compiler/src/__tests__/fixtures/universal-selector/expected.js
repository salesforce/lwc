function stylesheet(hostSelector, shadowSelector, transformHost, macroSelector) {
  return [macroSelector, " *", shadowSelector, " {}"].join('');
}
export default [stylesheet];