

import { createCachingCssGenerator } from 'lwc';

function generateCss(hostSelector, shadowSelector, nativeShadow, hasAdoptedStyleSheets) {
  return ["[turkey='val']", shadowSelector, " {}[keyboard='val']", shadowSelector, " {}[notif\\:true='val']", shadowSelector, " {}[notfor\\:item='val']", shadowSelector, " {}[notfor\\:each='val']", shadowSelector, " {}[notiterator\\:name='val']", shadowSelector, " {}"].join('');
}

var stylesheet = createCachingCssGenerator(generateCss);

export default [stylesheet];