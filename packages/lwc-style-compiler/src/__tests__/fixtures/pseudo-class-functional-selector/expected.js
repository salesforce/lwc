function stylesheet(hostSelector, shadowSelector, nativeShadow) {
  return ":not(p)" + shadowSelector + " {}\np:not(.foo, .bar)" + shadowSelector + " {}\n:matches(ol, li, span)" + shadowSelector + " {}\n";
}
export default [stylesheet];