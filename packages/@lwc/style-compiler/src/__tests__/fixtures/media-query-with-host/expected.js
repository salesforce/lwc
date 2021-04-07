

var cachedStylesheet

function generateCss(hostSelector, shadowSelector, nativeShadow) {
  return ["@media screen and (max-width: 768px) {", (nativeShadow ? ":host {width: calc(50% - 1rem);}" : [hostSelector, " {width: calc(50% - 1rem);}"].join('')), "}"].join('');
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