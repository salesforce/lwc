import varResolver from "custom-properties-resolver";


import { createCachingCssGenerator } from 'lwc';

function generateCss(hostSelector, shadowSelector, nativeShadow) {
  return [".a", shadowSelector, " {box-shadow: ", varResolver("--lwc-c-active-button-box-shadow","0 0 2px " + varResolver("--lwc-brand-accessible","#0070d2")), ";}"].join('');
}

const stylesheet = createCachingCssGenerator(generateCss);

export default [stylesheet];