function stylesheet(hostSelector, shadowSelector, transformHost, macroSelector) {
  return [macroSelector, " [dir=\"rtl\"]", shadowSelector, " test", shadowSelector, " {order: 0;}"].join('');
}
export default [stylesheet];