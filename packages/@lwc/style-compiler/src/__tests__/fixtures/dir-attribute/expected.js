function stylesheet(hostSelector, shadowSelector, nativeShadow) {
  return "[dir=\"rtl\"]" + shadowSelector + " test" + shadowSelector + " {order: 0;}\n";
}
export default [stylesheet];