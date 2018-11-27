function stylesheet(hostSelector, shadowSelector, nativeShadow) {
  return "input[min]" + shadowSelector + " {}\ninput[min=100]" + shadowSelector + " {}\n";
}
export default [stylesheet];