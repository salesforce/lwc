function stylesheet(hostSelector, shadowSelector, nativeShadow) {
  return "\n" + (nativeShadow ? (":host(.foo) {}") : (hostSelector + ".foo {}")) + "\n\n" + (nativeShadow ? (":host(.foo) span" + shadowSelector + " {}") : (hostSelector + ".foo span" + shadowSelector + " {}")) + "\n\n" + (nativeShadow ? (":host(:hover) {}") : (hostSelector + ":hover {}")) + "\n\n" + (nativeShadow ? (":host(.foo, .bar) {}") : (hostSelector + ".foo," + hostSelector + ".bar {}")) + "\n";
}
export default [stylesheet];