

import { createCachingCssGenerator } from 'lwc';

function generateCss(hostSelector, shadowSelector, nativeShadow, hasAdoptedStyleSheets) {
  return ["h1", shadowSelector, " {}.foo", shadowSelector, " {}[data-foo]", shadowSelector, " {}[data-foo=\"bar\"]", shadowSelector, " {}"].join('');
}

var stylesheet = createCachingCssGenerator(generateCss);

export default [stylesheet];