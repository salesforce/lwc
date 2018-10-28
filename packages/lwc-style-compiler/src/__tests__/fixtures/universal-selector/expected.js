function stylesheet(hostSelector, shadowSelector) {
  return `
*${shadowSelector} {}
`;
}
export default [stylesheet];