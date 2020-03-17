function stylesheet(hostSelector, shadowSelector, nativeShadow) {
  return ["[hidden]", shadowSelector, " {}\n[lang=\"fr\"]", shadowSelector, " {}\n"].join('');
}
export default [stylesheet];