function stylesheet(hostSelector, shadowSelector, nativeShadow) {
  return `input[min]${shadowSelector} {}
input[min=100]${shadowSelector} {}`;
}
export default [stylesheet];