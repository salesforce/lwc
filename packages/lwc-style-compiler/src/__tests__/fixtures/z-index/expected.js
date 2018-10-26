export default function(hostSelector, shadowSelector, nativeShadow) {
  return `
h1${shadowSelector}{z-index:100;display:block}
h2${shadowSelector}{z-index:500}
`
}
