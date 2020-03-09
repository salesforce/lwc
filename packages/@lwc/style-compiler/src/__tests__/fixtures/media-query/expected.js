function stylesheet(hostSelector, shadowSelector, nativeShadow) {
  return ["@media screen and (min-width: 900px) {h1", shadowSelector, " {}\n}"].join('');
}
export default [stylesheet];