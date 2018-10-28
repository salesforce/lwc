function stylesheet(hostSelector, shadowSelector) {
  return `
${shadowSelector}::after {}
h1${shadowSelector}::before {}
`
}
export default [
  stylesheet];