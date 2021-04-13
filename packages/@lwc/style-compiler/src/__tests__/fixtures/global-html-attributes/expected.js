

import { createCachingCssGenerator } from 'lwc';

function generateCss(hostSelector, shadowSelector, nativeShadow, hasAdoptedStyleSheets) {
  return ["[hidden]", shadowSelector, " {}[lang=\"fr\"]", shadowSelector, " {}"].join('');
}

var stylesheet = createCachingCssGenerator(generateCss);

export default [stylesheet];