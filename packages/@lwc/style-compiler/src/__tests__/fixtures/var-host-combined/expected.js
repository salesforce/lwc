import varResolver from "custom-properties-resolver";


var cachedStylesheet

function generateCss(hostSelector, shadowSelector, nativeShadow) {
  return [(nativeShadow ? [":host {color: ", varResolver("--lwc-color"), ";padding: 10px;}"].join('') : [hostSelector, " {color: ", varResolver("--lwc-color"), ";padding: 10px;}"].join('')), (nativeShadow ? [":host(.foo) {background: linear-gradient(to top,", varResolver("--lwc-color"), ",", varResolver("--lwc-other"), ");}"].join('') : [hostSelector, ".foo {background: linear-gradient(to top,", varResolver("--lwc-color"), ",", varResolver("--lwc-other"), ");}"].join('')), "div", shadowSelector, " {background: ", varResolver("--lwc-color",varResolver("--lwc-other","black")), ";display: \"block\";}"].join('');
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