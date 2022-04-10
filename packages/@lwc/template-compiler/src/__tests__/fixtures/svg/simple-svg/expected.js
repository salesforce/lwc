import { parseFragment, registerTemplate } from "lwc";
let $fragment1;
const $hoisted1 = parseFragment`<svg version="1.1" baseProfile="full" width="300" height="200" xmlns="http://www.w3.org/2000/svg"${1}${2}><rect width="100%" height="100%" fill="red"${1}${2}></rect><circle cx="150" cy="100" r="80" fill="green"${1}${2}></circle><text x="150" y="125" font-size="60" text-anchor="middle" fill="white"${1}${2}>SVG</text></svg>`;
function tmpl($api, $cmp, $slotset, $ctx) {
  const { h: api_element, t: api_text, st: api_static_fragment } = $api;
  return [api_static_fragment($fragment1 || ($fragment1 = $hoisted1()), 4)];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
