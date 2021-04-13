

import { createCachingCssGenerator } from 'lwc';

function generateCss(hostSelector, shadowSelector, nativeShadow, hasAdoptedStyleSheets) {
  return [":not(p)", shadowSelector, " {}p:not(.foo, .bar)", shadowSelector, " {}:matches(ol, li, span)", shadowSelector, " {}"].join('');
}

var stylesheet = createCachingCssGenerator(generateCss);

export default [stylesheet];