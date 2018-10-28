function stylesheet(hostSelector, shadowSelector) {
  return `
@media screen and (min-width: 900px) {h1${shadowSelector} {}
`
}
export default [
  stylesheet];