import varResolver from "custom-properties-resolver";


var cachedStylesheet

function generateCss(hostSelector, shadowSelector, nativeShadow) {
  return [".a", shadowSelector, " {box-shadow: ", varResolver("--lwc-c-active-button-box-shadow","0 0 2px " + varResolver("--lwc-brand-accessible","#0070d2")), ";}"].join('');
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