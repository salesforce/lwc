function stylesheet(hostSelector, shadowSelector, nativeShadow) {
  return "@supports (display: flex) {h1" + shadowSelector + " {}\n}";
}
export default [stylesheet];