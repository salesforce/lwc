import varResolver from "custom-properties-resolver";


import { createCachingCssGenerator } from 'lwc';

function generateCss(hostSelector, shadowSelector, nativeShadow) {
  return [(nativeShadow ? [":host {color: ", varResolver("--lwc-color"), ";padding: 10px;}"].join('') : [hostSelector, " {color: ", varResolver("--lwc-color"), ";padding: 10px;}"].join('')), (nativeShadow ? [":host(.foo) {background: linear-gradient(to top,", varResolver("--lwc-color"), ",", varResolver("--lwc-other"), ");}"].join('') : [hostSelector, ".foo {background: linear-gradient(to top,", varResolver("--lwc-color"), ",", varResolver("--lwc-other"), ");}"].join('')), "div", shadowSelector, " {background: ", varResolver("--lwc-color",varResolver("--lwc-other","black")), ";display: \"block\";}"].join('');
}

const stylesheet = createCachingCssGenerator(generateCss);

export default [stylesheet];