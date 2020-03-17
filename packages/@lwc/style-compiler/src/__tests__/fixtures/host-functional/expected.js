function stylesheet(hostSelector, shadowSelector, nativeShadow) {
  return ["\n", (nativeShadow ? ":host(.foo) {}" : [hostSelector, ".foo {}"].join('')), "\n\n", (nativeShadow ? [":host(.foo) span", shadowSelector, " {}"].join('') : [hostSelector, ".foo span", shadowSelector, " {}"].join('')), "\n\n", (nativeShadow ? ":host(:hover) {}" : [hostSelector, ":hover {}"].join('')), "\n\n", (nativeShadow ? ":host(.foo, .bar) {}" : [hostSelector, ".foo,", hostSelector, ".bar {}"].join('')), "\n"].join('');
}
export default [stylesheet];