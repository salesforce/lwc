function stylesheet(hostSelector, shadowSelector, nativeShadow) {
  return `
h1${shadowSelector} {}
.foo${shadowSelector} {}
[data-foo]${shadowSelector} {}
[data-foo="bar"]${shadowSelector} {}
`;
}
export default [stylesheet];