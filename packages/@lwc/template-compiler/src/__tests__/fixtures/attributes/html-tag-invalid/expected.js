import { parseFragment, registerTemplate } from "lwc";
let $fragment1;
const $hoisted1 = parseFragment`<section${1}${2}><textarea minlength="1" maxlength="5" unknown-attr="should-error"${1}${2}>x</textarea></section>`;
function tmpl($api, $cmp, $slotset, $ctx) {
  const { t: api_text, h: api_element, st: api_static_fragment } = $api;
  return [api_static_fragment($fragment1 || ($fragment1 = $hoisted1()), 2)];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
