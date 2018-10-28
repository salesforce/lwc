function stylesheet(hostSelector, shadowSelector) {
  return `
h1${shadowSelector} > a${shadowSelector} {}
h1${shadowSelector} + a${shadowSelector} {}
div.active${shadowSelector} > p${shadowSelector} {}
`
}
export default [
  stylesheet];