function stylesheet(hostSelector, shadowSelector, nativeShadow) {
  return "h1" + shadowSelector + ", h2" + shadowSelector + " {}\nh1" + shadowSelector + ",h2" + shadowSelector + "{}\n";
}
export default [stylesheet];