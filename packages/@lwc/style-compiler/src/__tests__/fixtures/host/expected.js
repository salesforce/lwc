

import { createCachingCssGenerator } from 'lwc';

function generateCss(hostSelector, shadowSelector, nativeShadow, hasAdoptedStyleSheets) {
  return (nativeShadow ? ":host {}" : [hostSelector, " {}"].join(''));
}

var stylesheet = createCachingCssGenerator(generateCss);

export default [stylesheet];