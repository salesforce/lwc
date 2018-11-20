function stylesheet(hostSelector, shadowSelector, nativeShadow) {
  return "[data-foo]" + shadowSelector + " {}\n[data-foo=\"bar\"]" + shadowSelector + " {}\n";
}
export default [stylesheet];