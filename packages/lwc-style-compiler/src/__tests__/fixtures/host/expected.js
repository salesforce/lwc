function stylesheet(hostSelector, shadowSelector, nativeShadow) {
  return `
${nativeShadow ? (":host {}") : ''}
${hostSelector} {}
`;
}
export default [stylesheet];