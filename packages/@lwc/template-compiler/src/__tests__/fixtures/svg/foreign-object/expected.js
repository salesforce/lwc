import { parseFragment, registerTemplate } from "lwc";
let $fragment1;
const $hoisted1 = parseFragment`<div${1}${2}><svg width="706" height="180"${1}${2}><g transform="translate(3,3)"${1}${2}><g transform="translate(250,0)"${1}${2}><foreignObject width="200" height="36" xlink:href="javascript:alert(1)"${1}${2}><a${1}${2}>x</a></foreignObject></g></g></svg></div>`;
function tmpl($api, $cmp, $slotset, $ctx) {
  const { t: api_text, h: api_element, st: api_static_fragment } = $api;
  return [api_static_fragment($fragment1 || ($fragment1 = $hoisted1()), 6)];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
