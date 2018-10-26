export default function(hostSelector, shadowSelector, nativeShadow) {
  return `
[hidden]${shadowSelector} {}
[lang="fr"]${shadowSelector} {}
`
}
