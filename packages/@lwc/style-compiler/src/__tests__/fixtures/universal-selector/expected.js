function stylesheet(hostSelector, shadowSelector, nativeShadow) {
  return ["*", shadowSelector, " {}"].join('');
}
export default [stylesheet];