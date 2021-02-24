function stylesheet(hostSelector, shadowSelector, nativeShadow) {
  return ["[aria-labelledby]", shadowSelector, " {}[aria-labelledby=\"bar\"]", shadowSelector, " {}"].join('');
}
export default [stylesheet];