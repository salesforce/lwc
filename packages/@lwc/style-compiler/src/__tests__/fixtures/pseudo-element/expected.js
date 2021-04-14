

import { createCachingCssGenerator } from 'lwc';

function generateCss(hostSelector, shadowSelector, nativeShadow) {
  return [shadowSelector, "::after {}h1", shadowSelector, "::before {}"].join('');
}

const stylesheet = createCachingCssGenerator(generateCss);

export default [stylesheet];