

import { createCachingCssGenerator } from 'lwc';

function generateCss(hostSelector, shadowSelector, nativeShadow, hasAdoptedStyleSheets) {
  return ["@media screen and (min-width: 900px) {h1", shadowSelector, " {}}"].join('');
}

var stylesheet = createCachingCssGenerator(generateCss);

export default [stylesheet];