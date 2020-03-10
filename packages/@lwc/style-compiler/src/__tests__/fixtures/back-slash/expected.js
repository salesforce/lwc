function stylesheet(hostSelector, shadowSelector, nativeShadow) {
  return [".foo", shadowSelector, " {content: \"\\\\\";}\n"].join('');
}
export default [stylesheet];