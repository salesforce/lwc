import varResolver from "custom-properties-resolver";


var cachedStylesheet

function generateCss(hostSelector, shadowSelector, nativeShadow) {
  return ["div", shadowSelector, " {color: ", varResolver("--lwc-color"), ",", varResolver("--lwc-other"), ";}div", shadowSelector, " {border: ", varResolver("--border","1px solid rgba(0,0,0,0.1)"), ";}div", shadowSelector, " {background: linear-gradient(to top,", varResolver("--lwc-color"), ",", varResolver("--lwc-other"), ");}"].join('');
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