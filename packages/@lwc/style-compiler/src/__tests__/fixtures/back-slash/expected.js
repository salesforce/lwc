

import { createCachingCssGenerator } from 'lwc';

function generateCss(hostSelector, shadowSelector, nativeShadow) {
  return [".foo", shadowSelector, " {content: \"\\\\\";}"].join('');
}

const stylesheet = createCachingCssGenerator(generateCss);

export default [stylesheet];