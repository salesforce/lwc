

var cachedStylesheet

function generateCss(hostSelector, shadowSelector, nativeShadow) {
  return ["@supports (display: flex) {h1", shadowSelector, " {}}"].join('');
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