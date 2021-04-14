

import { createCachingCssGenerator } from 'lwc';

function generateCss(hostSelector, shadowSelector, nativeShadow) {
  return ["@media screen and (max-width: 768px) {", (nativeShadow ? ":host {width: calc(50% - 1rem);}" : [hostSelector, " {width: calc(50% - 1rem);}"].join('')), "}"].join('');
}

const stylesheet = createCachingCssGenerator(generateCss);

export default [stylesheet];