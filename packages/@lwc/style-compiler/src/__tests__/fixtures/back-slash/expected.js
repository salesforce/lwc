function stylesheet(hostSelector, shadowSelector, nativeShadow) {
  return [".foo", shadowSelector, " {content: \"\\\\\";}"].join('');
}
export default [stylesheet];