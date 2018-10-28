function stylesheet(hostSelector, shadowSelector) {
  return `
@supports (display: flex) {h1${shadowSelector} {}
`;
}
export default [stylesheet];