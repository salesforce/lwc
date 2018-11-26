function stylesheet(hostSelector, shadowSelector, nativeShadow) {
  return ".foo" + shadowSelector + " {content: \"\\\\\";}\n";
}
export default [stylesheet];