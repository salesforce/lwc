function stylesheet(hostSelector, shadowSelector, nativeShadow) {
  return `
#foo${shadowSelector} {}
`;
}
export default [stylesheet];