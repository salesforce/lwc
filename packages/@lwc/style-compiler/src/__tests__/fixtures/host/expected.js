function stylesheet(hostSelector, shadowSelector, nativeShadow) {
  return ["\n", (nativeShadow ? ":host {}" : [hostSelector, " {}"].join('')), "\n"].join('');
}
export default [stylesheet];