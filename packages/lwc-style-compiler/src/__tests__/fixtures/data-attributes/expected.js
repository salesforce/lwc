function stylesheet(hostSelector, shadowSelector, nativeShadow) {
  return `
[data-foo]${shadowSelector} {}
[data-foo="bar"]${shadowSelector} {}
`;
}
export default [stylesheet];