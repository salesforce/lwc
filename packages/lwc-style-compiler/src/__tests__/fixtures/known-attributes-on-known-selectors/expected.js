function stylesheet(hostSelector, shadowSelector) {
  return `
input[min]${shadowSelector} {}
input[min=100]${shadowSelector} {}
`
}
export default [
  stylesheet];