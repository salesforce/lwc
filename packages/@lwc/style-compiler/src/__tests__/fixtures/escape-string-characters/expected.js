

import { createCachingCssGenerator } from 'lwc';

function generateCss(hostSelector, shadowSelector, nativeShadow, hasAdoptedStyleSheets) {
  return ["h1", shadowSelector, ":before {content: '$test\"escaping quote(\\')'}h1", shadowSelector, ":after {content: \"$my test'escaping quote(\\\")\"}h2", shadowSelector, ":before {content: \"\\\\\\\\\"}h2", shadowSelector, ":after {content: \"`\"}"].join('');
}

var stylesheet = createCachingCssGenerator(generateCss);

export default [stylesheet];