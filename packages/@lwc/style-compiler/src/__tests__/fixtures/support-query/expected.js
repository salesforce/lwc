

import { createCachingCssGenerator } from 'lwc';

function generateCss(hostSelector, shadowSelector, nativeShadow) {
  return ["@supports (display: flex) {h1", shadowSelector, " {}}"].join('');
}

const stylesheet = createCachingCssGenerator(generateCss);

export default [stylesheet];