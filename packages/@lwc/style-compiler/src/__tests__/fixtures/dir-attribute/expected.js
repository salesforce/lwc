function stylesheet(hostSelector, shadowSelector, nativeShadow) {
  return ["[dir=\"rtl\"]", shadowSelector, " test", shadowSelector, " {order: 0;}\n"].join('');
}
export default [stylesheet];