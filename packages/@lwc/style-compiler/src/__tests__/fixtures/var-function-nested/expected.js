import varResolver from "custom-properties-resolver";


var cachedStylesheet

function generateCss(hostSelector, shadowSelector, nativeShadow) {
  return ["div", shadowSelector, " {background: ", varResolver("--lwc-color",varResolver("--lwc-other","black")), ";}"].join('');
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