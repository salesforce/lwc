function stylesheet(hostSelector, shadowSelector, nativeShadow) {
  return `
${shadowSelector}::after {}
h1${shadowSelector}::before {}
`;
}
export default [stylesheet];