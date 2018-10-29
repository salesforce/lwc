function stylesheet(hostSelector, shadowSelector, nativeShadow) {
  return `
${nativeShadow ? (":host(.foo) {}") : ''}
${hostSelector}.foo {}
${nativeShadow ? (":host(.foo) span" + shadowSelector + " {}") : ''}
${hostSelector}.foo span${shadowSelector} {}
${nativeShadow ? (":host(:hover) {}") : ''}
${hostSelector}:hover {}
${nativeShadow ? (":host(.foo, .bar) {}") : ''}
${hostSelector}.foo,${hostSelector}.bar {}
`;
}
export default [stylesheet];