function stylesheet(hostSelector, shadowSelector, nativeShadow) {
  return [":checked", shadowSelector, " {}\nul", shadowSelector, " li:first-child", shadowSelector, " a", shadowSelector, " {}\n"].join('');
}
export default [stylesheet];