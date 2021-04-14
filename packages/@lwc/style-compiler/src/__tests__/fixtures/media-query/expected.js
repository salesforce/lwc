

import { createCachingCssGenerator } from 'lwc';

function generateCss(hostSelector, shadowSelector, nativeShadow) {
  return ["@media screen and (min-width: 900px) {h1", shadowSelector, " {}}"].join('');
}

const stylesheet = createCachingCssGenerator(generateCss);

export default [stylesheet];