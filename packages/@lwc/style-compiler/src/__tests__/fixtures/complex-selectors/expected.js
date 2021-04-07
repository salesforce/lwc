

var cachedStylesheet

function generateCss(hostSelector, shadowSelector, nativeShadow) {
  return ["h1", shadowSelector, " > a", shadowSelector, " {}h1", shadowSelector, " + a", shadowSelector, " {}div.active", shadowSelector, " > p", shadowSelector, " {}"].join('');
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