

var cachedStylesheet

function generateCss(hostSelector, shadowSelector, nativeShadow) {
  return ["[turkey='val']", shadowSelector, " {}[keyboard='val']", shadowSelector, " {}[notif\\:true='val']", shadowSelector, " {}[notfor\\:item='val']", shadowSelector, " {}[notfor\\:each='val']", shadowSelector, " {}[notiterator\\:name='val']", shadowSelector, " {}"].join('');
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