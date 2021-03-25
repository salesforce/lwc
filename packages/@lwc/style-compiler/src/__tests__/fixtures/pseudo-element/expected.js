function stylesheet(hostSelector, shadowSelector, transformHost, macroSelector) {
  return [macroSelector, " ", shadowSelector, "::after {}", macroSelector, " h1", shadowSelector, "::before {}"].join('');
}
export default [stylesheet];