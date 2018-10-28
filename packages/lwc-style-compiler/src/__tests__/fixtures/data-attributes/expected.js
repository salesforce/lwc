function stylesheet(hostSelector, shadowSelector) {
  return `
[data-foo]${shadowSelector} {}
[data-foo="bar"]${shadowSelector} {}
`;
}
export default [stylesheet];