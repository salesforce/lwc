function stylesheet(hostSelector, shadowSelector, nativeShadow) {
  return `
h1${shadowSelector}, h2${shadowSelector} {}
h1${shadowSelector},h2${shadowSelector}{}
`;
}
export default [stylesheet];