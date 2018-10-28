function stylesheet(hostSelector, shadowSelector) {
  return `
#foo${shadowSelector} {}
`
}
export default [
  stylesheet];