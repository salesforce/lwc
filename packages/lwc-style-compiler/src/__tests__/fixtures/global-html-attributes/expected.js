function stylesheet(hostSelector, shadowSelector, nativeShadow) {
  return `[hidden]${shadowSelector} {}
[lang="fr"]${shadowSelector} {}`;
}
export default [stylesheet];