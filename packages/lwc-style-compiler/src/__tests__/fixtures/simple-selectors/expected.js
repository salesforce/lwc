function stylesheet(hostSelector, shadowSelector) {
  return `
h1${shadowSelector} {}
.foo${shadowSelector} {}
[data-foo]${shadowSelector} {}
[data-foo="bar"]${shadowSelector} {}
`
}
export default [
  stylesheet];