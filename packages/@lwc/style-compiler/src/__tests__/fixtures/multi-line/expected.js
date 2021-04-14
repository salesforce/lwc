

import { createCachingCssGenerator } from 'lwc';

function generateCss(hostSelector, shadowSelector, nativeShadow) {
  return [(nativeShadow ? [":host(.selected) button", shadowSelector, " {color: #0070d2;}"].join('') : [hostSelector, ".selected button", shadowSelector, " {color: #0070d2;}"].join('')), (nativeShadow ? [":host:not(.selected) button", shadowSelector, " {color: #6d6d70;transition: all .2s ease-in-out;}"].join('') : [hostSelector, ":not(.selected) button", shadowSelector, " {color: #6d6d70;transition: all .2s ease-in-out;}"].join('')), (nativeShadow ? [":host:not(.selected):hover button", shadowSelector, ",:host button:focus", shadowSelector, " {color: #005fb2;transform: scale(1.2);}"].join('') : [hostSelector, ":not(.selected):hover button", shadowSelector, ",", hostSelector, " button:focus", shadowSelector, " {color: #005fb2;transform: scale(1.2);}"].join('')), "button:focus", shadowSelector, " {outline: none;box-shadow: none;background-color: #f3f2f2;}"].join('');
}

const stylesheet = createCachingCssGenerator(generateCss);

export default [stylesheet];