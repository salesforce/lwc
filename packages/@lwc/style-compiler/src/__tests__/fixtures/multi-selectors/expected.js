

import { createCachingCssGenerator } from 'lwc';

function generateCss(hostSelector, shadowSelector, nativeShadow, hasAdoptedStyleSheets) {
  return ["h1", shadowSelector, ", h2", shadowSelector, " {}h1", shadowSelector, ",h2", shadowSelector, "{}"].join('');
}

var stylesheet = createCachingCssGenerator(generateCss);

export default [stylesheet];