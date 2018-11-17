function stylesheet(hostSelector, shadowSelector, nativeShadow) {
  return `.foo${shadowSelector} {content: "\\\\";}`;
}
export default [stylesheet];