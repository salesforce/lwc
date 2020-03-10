function stylesheet(hostSelector, shadowSelector, nativeShadow) {
  return ["*", shadowSelector, " {}\n"].join('');
}
export default [stylesheet];