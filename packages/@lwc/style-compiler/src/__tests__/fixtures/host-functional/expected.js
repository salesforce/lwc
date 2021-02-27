function stylesheet(hostSelector, shadowSelector, nativeShadow) {
  return [(nativeShadow ? ":host(.foo) {}" : [hostSelector, ".foo {}"].join('')), (nativeShadow ? [":host(.foo) span", shadowSelector, " {}"].join('') : [hostSelector, ".foo span", shadowSelector, " {}"].join('')), (nativeShadow ? ":host(:hover) {}" : [hostSelector, ":hover {}"].join('')), (nativeShadow ? ":host(.foo, .bar) {}" : [hostSelector, ".foo,", hostSelector, ".bar {}"].join(''))].join('');
}
export default [stylesheet];