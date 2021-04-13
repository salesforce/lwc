

import { createCachingCssGenerator } from 'lwc';

function generateCss(hostSelector, shadowSelector, nativeShadow, hasAdoptedStyleSheets) {
  return ["@supports (display: flex) {h1", shadowSelector, " {}}"].join('');
}

var stylesheet = createCachingCssGenerator(generateCss);

export default [stylesheet];