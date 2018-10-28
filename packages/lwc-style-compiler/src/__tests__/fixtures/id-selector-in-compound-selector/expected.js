function stylesheet(hostSelector, shadowSelector) {
  return `
#foo.active${shadowSelector} {}
`;
}
export default [stylesheet];