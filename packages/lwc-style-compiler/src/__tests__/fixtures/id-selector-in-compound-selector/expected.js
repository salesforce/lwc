function stylesheet(hostSelector, shadowSelector, nativeShadow) {
  return `
#foo.active${shadowSelector} {}
`;
}
export default [stylesheet];