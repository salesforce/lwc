

import { createCachingCssGenerator } from 'lwc';

function generateCss(hostSelector, shadowSelector, nativeShadow, hasAdoptedStyleSheets) {
  return ["@media screen and (max-width: 768px) {", (nativeShadow ? ":host {width: calc(50% - 1rem);}" : [hostSelector, " {width: calc(50% - 1rem);}"].join('')), "}"].join('');
}

var stylesheet = createCachingCssGenerator(generateCss);

export default [stylesheet];