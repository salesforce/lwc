

import { createCachingCssGenerator } from 'lwc';

function generateCss(hostSelector, shadowSelector, nativeShadow, hasAdoptedStyleSheets) {
  return ["h1", shadowSelector, " > a", shadowSelector, " {}h1", shadowSelector, " + a", shadowSelector, " {}div.active", shadowSelector, " > p", shadowSelector, " {}"].join('');
}

var stylesheet = createCachingCssGenerator(generateCss);

export default [stylesheet];