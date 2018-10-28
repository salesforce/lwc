function stylesheet(hostSelector, shadowSelector) {
  return `
[aria-labelledby]${shadowSelector} {}
[aria-labelledby="bar"]${shadowSelector} {}
`
}
export default [
  stylesheet];