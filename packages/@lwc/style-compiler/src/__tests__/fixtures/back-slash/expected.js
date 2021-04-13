

import { createCachingCssGenerator } from 'lwc';

function generateCss(hostSelector, shadowSelector, nativeShadow, hasAdoptedStyleSheets) {
  return [".foo", shadowSelector, " {content: \"\\\\\";}"].join('');
}

var stylesheet = createCachingCssGenerator(generateCss);

export default [stylesheet];