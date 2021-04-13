

import { createCachingCssGenerator } from 'lwc';

function generateCss(hostSelector, shadowSelector, nativeShadow, hasAdoptedStyleSheets) {
  return ["*", shadowSelector, " {}"].join('');
}

var stylesheet = createCachingCssGenerator(generateCss);

export default [stylesheet];