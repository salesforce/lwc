

var cachedStylesheet

function generateCss(hostSelector, shadowSelector, nativeShadow) {
  return ["h1", shadowSelector, ", h2", shadowSelector, " {}h1", shadowSelector, ",h2", shadowSelector, "{}"].join('');
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