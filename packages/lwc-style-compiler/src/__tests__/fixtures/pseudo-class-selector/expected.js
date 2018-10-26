export default function(hostSelector, shadowSelector, nativeShadow) {
  return `
:checked${shadowSelector} {}
ul${shadowSelector} li:first-child${shadowSelector} a${shadowSelector} {}
`
}
