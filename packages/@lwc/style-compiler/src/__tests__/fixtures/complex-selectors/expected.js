function stylesheet(hostSelector, shadowSelector, nativeShadow) {
  return "h1" + shadowSelector + " > a" + shadowSelector + " {}\nh1" + shadowSelector + " + a" + shadowSelector + " {}\ndiv.active" + shadowSelector + " > p" + shadowSelector + " {}\n";
}
export default [stylesheet];