export default function(hostSelector, shadowSelector, nativeShadow) {
  return `
${shadowSelector}::after {}
h1${shadowSelector}::before {}
`
}
