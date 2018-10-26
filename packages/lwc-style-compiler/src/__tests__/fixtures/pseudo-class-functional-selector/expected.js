export default function(hostSelector, shadowSelector, nativeShadow) {
  return `
:not(p)${shadowSelector} {}
p:not(.foo, .bar)${shadowSelector} {}
:matches(ol, li, span)${shadowSelector} {}
`
}
