import { parseFragment, registerTemplate, sanitizeAttribute } from "lwc";
let $fragment1;
const $hoisted1 = parseFragment`<svg viewBox="0 0 5 5" aria-hidden="true" class="slds-button__icon${0}"${2}><use xlink:href="/x"${1}${2}></use></svg>`;
function tmpl($api, $cmp, $slotset, $ctx) {
  const { h: api_element, st: api_static_fragment } = $api;
  return [api_static_fragment($fragment1 || ($fragment1 = $hoisted1()), 2)];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
