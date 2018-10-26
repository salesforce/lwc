export default function(hostSelector, shadowSelector, nativeShadow) {
  return `
.foo${shadowSelector} {content: "\\";}
`
}
