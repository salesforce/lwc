

import { createCachingCssGenerator } from 'lwc';

function generateCss(hostSelector, shadowSelector, nativeShadow, hasAdoptedStyleSheets) {
  return [shadowSelector, "::after {}h1", shadowSelector, "::before {}"].join('');
}

var stylesheet = createCachingCssGenerator(generateCss);

export default [stylesheet];