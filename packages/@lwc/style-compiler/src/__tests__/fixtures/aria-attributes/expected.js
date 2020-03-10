function stylesheet(hostSelector, shadowSelector, nativeShadow) {
  return ["[aria-labelledby]", shadowSelector, " {}\n[aria-labelledby=\"bar\"]", shadowSelector, " {}\n"].join('');
}
export default [stylesheet];