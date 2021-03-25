function stylesheet(hostSelector, shadowSelector, transformHost, macroSelector) {
  return [(transformHost ? [hostSelector, ".foo {}"].join('') : ":host(.foo) {}"), (transformHost ? [hostSelector, ".foo span", shadowSelector, " {}"].join('') : [":host(.foo) span", shadowSelector, " {}"].join('')), (transformHost ? [hostSelector, ":hover {}"].join('') : ":host(:hover) {}"), (transformHost ? [hostSelector, ".foo,", hostSelector, ".bar {}"].join('') : ":host(.foo, .bar) {}")].join('');
}
export default [stylesheet];