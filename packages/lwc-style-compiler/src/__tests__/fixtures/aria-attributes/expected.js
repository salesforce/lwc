export default function(hostSelector, shadowSelector, nativeShadow) {
  return `
[aria-labelledby]${shadowSelector} {}
[aria-labelledby="bar"]${shadowSelector} {}
`
}
