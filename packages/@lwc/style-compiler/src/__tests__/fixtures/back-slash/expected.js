function stylesheet(hostSelector, shadowSelector, transformHost, macroSelector) {
  return [macroSelector, " .foo", shadowSelector, " {content: \"\\\\\";}"].join('');
}
export default [stylesheet];