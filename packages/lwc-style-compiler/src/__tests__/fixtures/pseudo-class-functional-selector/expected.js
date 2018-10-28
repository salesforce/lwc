function stylesheet(hostSelector, shadowSelector) {
  return `
:not(p)${shadowSelector} {}
p:not(.foo, .bar)${shadowSelector} {}
:matches(ol, li, span)${shadowSelector} {}
`
}
export default [
  stylesheet];