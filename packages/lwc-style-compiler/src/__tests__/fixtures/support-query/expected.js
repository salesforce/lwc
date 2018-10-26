export default function(hostSelector, shadowSelector, nativeShadow) {
  return `
@supports (display: flex) {h1${shadowSelector} {}
`
}
