function stylesheet(hostSelector, shadowSelector, transformHost, macroSelector) {
  return (transformHost ? [hostSelector, " {}"].join('') : ":host {}");
}
export default [stylesheet];