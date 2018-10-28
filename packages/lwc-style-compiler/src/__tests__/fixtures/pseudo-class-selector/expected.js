function stylesheet(hostSelector, shadowSelector) {
  return `
:checked${shadowSelector} {}
ul${shadowSelector} li:first-child${shadowSelector} a${shadowSelector} {}
`;
}
export default [stylesheet];