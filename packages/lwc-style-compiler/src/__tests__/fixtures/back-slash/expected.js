function stylesheet(hostSelector, shadowSelector) {
  return `
.foo${shadowSelector} {content: "\\\\";}
`;
}
export default [stylesheet];