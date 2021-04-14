

import { createCachingCssGenerator } from 'lwc';

function generateCss(hostSelector, shadowSelector, nativeShadow) {
  return (nativeShadow ? ":host {}" : [hostSelector, " {}"].join(''));
}

const stylesheet = createCachingCssGenerator(generateCss);

export default [stylesheet];