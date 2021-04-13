

import { createCachingCssGenerator } from 'lwc';

function generateCss(hostSelector, shadowSelector, nativeShadow, hasAdoptedStyleSheets) {
  return ["[dir=\"rtl\"]", shadowSelector, " test", shadowSelector, " {order: 0;}"].join('');
}

var stylesheet = createCachingCssGenerator(generateCss);

export default [stylesheet];