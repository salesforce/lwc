import varResolver from "custom-properties-resolver";


import { createCachingCssGenerator } from 'lwc';

function generateCss(hostSelector, shadowSelector, nativeShadow, hasAdoptedStyleSheets) {
  return ["div", shadowSelector, " {color: ", varResolver("--lwc-color"), ";}div", shadowSelector, " {color: ", varResolver("--lwc-color","black"), ";}div", shadowSelector, " {color: ", varResolver("--lwc-color"), " important;}"].join('');
}

var stylesheet = createCachingCssGenerator(generateCss);

export default [stylesheet];