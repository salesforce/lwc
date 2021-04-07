import varResolver from "custom-properties-resolver";


var cachedStylesheet

function generateCss(hostSelector, shadowSelector, nativeShadow) {
  return ["div", shadowSelector, " {color: ", varResolver("--lwc-color"), ";}div", shadowSelector, " {color: ", varResolver("--lwc-color","black"), ";}div", shadowSelector, " {color: ", varResolver("--lwc-color"), " important;}"].join('');
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