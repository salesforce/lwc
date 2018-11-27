function stylesheet(hostSelector, shadowSelector, nativeShadow) {
  return "h1" + shadowSelector + " {}\n.foo" + shadowSelector + " {}\n[data-foo]" + shadowSelector + " {}\n[data-foo=\"bar\"]" + shadowSelector + " {}\n";
}
export default [stylesheet];