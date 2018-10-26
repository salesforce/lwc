export default function(hostSelector, shadowSelector, nativeShadow) {
  return `
${nativeShadow ? (":host {}") : ''}
${hostSelector} {}
`
}
