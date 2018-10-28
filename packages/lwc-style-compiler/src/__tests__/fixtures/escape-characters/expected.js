function stylesheet(hostSelector, shadowSelector) {
  return `
h1${shadowSelector}:before {content: 'my test"escaping quote(\')'}
h1${shadowSelector}:after {content: "my test'escaping quote(\")"}
h2${shadowSelector}:before {content: "\\\\"}
h2${shadowSelector}:after {content: "`"}
`
}
export default [
  stylesheet];