function stylesheet(hostSelector, shadowSelector, nativeShadow) {
  return (nativeShadow ? ":host {}" : [hostSelector, " {}"].join(''));
}
export default [stylesheet];