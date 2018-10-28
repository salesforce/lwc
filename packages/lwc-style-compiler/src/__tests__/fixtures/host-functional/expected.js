function stylesheet(hostSelector, shadowSelector) {
  return `
${hostSelector}.foo {}
${hostSelector}.foo span${shadowSelector} {}
${hostSelector}:hover {}
${hostSelector}.foo,${hostSelector}.bar {}
`;
}
export default [stylesheet];