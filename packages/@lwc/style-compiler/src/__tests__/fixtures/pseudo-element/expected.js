function stylesheet(hostSelector, shadowSelector, nativeShadow) {
  return shadowSelector + "::after {}\nh1" + shadowSelector + "::before {}\n";
}
export default [stylesheet];