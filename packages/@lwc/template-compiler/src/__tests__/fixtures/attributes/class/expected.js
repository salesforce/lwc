import { parseFragment, registerTemplate } from "lwc";
let $fragment1;
const $hoisted1 = parseFragment`<div class="foo${0}"${2}></div>`;
let $fragment2;
const $hoisted2 = parseFragment`<div class="foo bar${0}"${2}></div>`;
let $fragment3;
const $hoisted3 = parseFragment`<div class=" foo bar   ${0}"${2}></div>`;
let $fragment4;
const $hoisted4 = parseFragment`<div class="foo   bar${0}"${2}></div>`;
function tmpl($api, $cmp, $slotset, $ctx) {
  const { st: api_static_fragment } = $api;
  return [
    api_static_fragment($fragment1 || ($fragment1 = $hoisted1()), 1),
    api_static_fragment($fragment2 || ($fragment2 = $hoisted2()), 3),
    api_static_fragment($fragment3 || ($fragment3 = $hoisted3()), 5),
    api_static_fragment($fragment4 || ($fragment4 = $hoisted4()), 7),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
