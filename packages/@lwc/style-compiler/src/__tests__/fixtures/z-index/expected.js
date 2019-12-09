function stylesheet(hostSelector, shadowSelector, nativeShadow) {
  return "h1" + shadowSelector + "{display: block;z-index: 100;}h2" + shadowSelector + "{z-index: 500;}";
}
export default [stylesheet];