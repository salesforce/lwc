import { parseFragment, registerTemplate, sanitizeAttribute } from "lwc";
let $fragment1;
const $hoisted1 = parseFragment`<svg aria-hidden="true" class="slds-icon${0}" title="when needed"${2}><use xlink:href="/assets/icons/standard-sprite/svg/symbols.svg#case"${1}${2}></use></svg>`;
function tmpl($api, $cmp, $slotset, $ctx) {
  const { h: api_element, st: api_static_fragment } = $api;
  return [api_static_fragment($fragment1 || ($fragment1 = $hoisted1()), 2)];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
