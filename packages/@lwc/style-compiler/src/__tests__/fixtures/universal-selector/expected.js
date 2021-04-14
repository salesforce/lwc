

import { createCachingCssGenerator } from 'lwc';

function generateCss(hostSelector, shadowSelector, nativeShadow) {
  return ["*", shadowSelector, " {}"].join('');
}

const stylesheet = createCachingCssGenerator(generateCss);

export default [stylesheet];