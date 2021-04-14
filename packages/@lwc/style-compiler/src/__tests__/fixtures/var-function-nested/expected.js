import varResolver from "custom-properties-resolver";


import { createCachingCssGenerator } from 'lwc';

function generateCss(hostSelector, shadowSelector, nativeShadow) {
  return ["div", shadowSelector, " {background: ", varResolver("--lwc-color",varResolver("--lwc-other","black")), ";}"].join('');
}

const stylesheet = createCachingCssGenerator(generateCss);

export default [stylesheet];