function stylesheet(hostSelector, shadowSelector) {
  return `
h1${shadowSelector}, h2${shadowSelector} {}
h1${shadowSelector},
h2${shadowSelector}
{}
`
}
export default [
  stylesheet];