function stylesheet(hostSelector, shadowSelector, transformHost, macroSelector) {
  return [macroSelector, " :not(p)", shadowSelector, " {}", macroSelector, " p:not(.foo, .bar)", shadowSelector, " {}", macroSelector, " :matches(ol, li, span)", shadowSelector, " {}"].join('');
}
export default [stylesheet];