export default function(hostSelector, shadowSelector, nativeShadow) {
  return `
[data-foo]${shadowSelector} {}
[data-foo="bar"]${shadowSelector} {}
`
}
