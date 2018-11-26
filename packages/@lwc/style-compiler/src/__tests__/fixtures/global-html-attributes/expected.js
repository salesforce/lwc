function stylesheet(hostSelector, shadowSelector, nativeShadow) {
  return "[hidden]" + shadowSelector + " {}\n[lang=\"fr\"]" + shadowSelector + " {}\n";
}
export default [stylesheet];