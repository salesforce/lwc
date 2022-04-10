import { parseFragment, registerTemplate } from "lwc";
let $fragment1;
const $hoisted1 = parseFragment`<section${1}${2}><color-profile local="x"${1}${2}></color-profile></section>`;
function tmpl($api, $cmp, $slotset, $ctx) {
  const { h: api_element, st: api_static_fragment } = $api;
  return [api_static_fragment($fragment1 || ($fragment1 = $hoisted1()), 2)];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
