import varResolver from "custom-properties-resolver";


import { createCachingCssGenerator } from 'lwc';

function generateCss(hostSelector, shadowSelector, nativeShadow) {
  return ["div", shadowSelector, " {color: ", varResolver("--lwc-color"), ",", varResolver("--lwc-other"), ";}div", shadowSelector, " {border: ", varResolver("--border","1px solid rgba(0,0,0,0.1)"), ";}div", shadowSelector, " {background: linear-gradient(to top,", varResolver("--lwc-color"), ",", varResolver("--lwc-other"), ");}"].join('');
}

const stylesheet = createCachingCssGenerator(generateCss);

export default [stylesheet];