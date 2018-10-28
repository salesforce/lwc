function stylesheet(hostSelector, shadowSelector) {
  return `
[hidden]${shadowSelector} {}
[lang="fr"]${shadowSelector} {}
`;
}
export default [stylesheet];