

var cachedStylesheet

function generateCss(hostSelector, shadowSelector, nativeShadow) {
  return [(nativeShadow ? ":host(.foo) {}" : [hostSelector, ".foo {}"].join('')), (nativeShadow ? [":host(.foo) span", shadowSelector, " {}"].join('') : [hostSelector, ".foo span", shadowSelector, " {}"].join('')), (nativeShadow ? ":host(:hover) {}" : [hostSelector, ":hover {}"].join('')), (nativeShadow ? ":host(.foo, .bar) {}" : [hostSelector, ".foo,", hostSelector, ".bar {}"].join(''))].join('');
}

function stylesheet(hostSelector, shadowSelector, nativeShadow, hasAdoptedStyleSheets) {
  if (nativeShadow && hasAdoptedStyleSheets) {
    if (!cachedStylesheet) {
      cachedStylesheet = new CSSStyleSheet();
      cachedStylesheet.replaceSync(generateCss(hostSelector, shadowSelector, nativeShadow));
    }
    return cachedStylesheet; // fast path
  }
  return generateCss(hostSelector, shadowSelector, nativeShadow);
}
export default [stylesheet];