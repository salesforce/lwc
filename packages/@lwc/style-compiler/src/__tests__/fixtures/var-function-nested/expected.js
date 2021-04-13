import varResolver from "custom-properties-resolver";


import { createCachingCssGenerator } from 'lwc';

function generateCss(hostSelector, shadowSelector, nativeShadow, hasAdoptedStyleSheets) {
  return ["div", shadowSelector, " {background: ", varResolver("--lwc-color",varResolver("--lwc-other","black")), ";}"].join('');
}

var stylesheet = createCachingCssGenerator(generateCss);

export default [stylesheet];