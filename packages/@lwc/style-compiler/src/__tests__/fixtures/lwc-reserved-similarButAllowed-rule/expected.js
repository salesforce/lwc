

import { createCachingCssGenerator } from 'lwc';

function generateCss(hostSelector, shadowSelector, nativeShadow) {
  return ["[turkey='val']", shadowSelector, " {}[keyboard='val']", shadowSelector, " {}[notif\\:true='val']", shadowSelector, " {}[notfor\\:item='val']", shadowSelector, " {}[notfor\\:each='val']", shadowSelector, " {}[notiterator\\:name='val']", shadowSelector, " {}"].join('');
}

const stylesheet = createCachingCssGenerator(generateCss);

export default [stylesheet];