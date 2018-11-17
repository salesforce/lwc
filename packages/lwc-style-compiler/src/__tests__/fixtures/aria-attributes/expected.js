function stylesheet(hostSelector, shadowSelector, nativeShadow) {
  return `[aria-labelledby]${shadowSelector} {}
[aria-labelledby="bar"]${shadowSelector} {}`;
}
export default [stylesheet];