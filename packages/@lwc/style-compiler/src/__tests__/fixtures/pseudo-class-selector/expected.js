

import { createCachingCssGenerator } from 'lwc';

function generateCss(hostSelector, shadowSelector, nativeShadow, hasAdoptedStyleSheets) {
  return [":checked", shadowSelector, " {}ul", shadowSelector, " li:first-child", shadowSelector, " a", shadowSelector, " {}"].join('');
}

var stylesheet = createCachingCssGenerator(generateCss);

export default [stylesheet];