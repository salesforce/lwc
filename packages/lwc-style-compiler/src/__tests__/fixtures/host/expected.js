function stylesheet(hostSelector, shadowSelector, nativeShadow) {
  return "\n" + (nativeShadow ? (":host {}") : (hostSelector + " {}")) + "\n";
}
export default [stylesheet];