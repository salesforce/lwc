import { parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<div class="foo${0}"${2}></div>`;
const $fragment2 = parseFragment`<div class="foo bar${0}"${2}></div>`;
const $fragment3 = parseFragment`<div class=" foo bar   ${0}"${2}></div>`;
const $fragment4 = parseFragment`<div class="foo   bar${0}"${2}></div>`;
function tmpl($api, $cmp, $slotset, $ctx) {
  const { st: api_static_fragment } = $api;
  return [
    api_static_fragment($fragment1(), 1),
    api_static_fragment($fragment2(), 3),
    api_static_fragment($fragment3(), 5),
    api_static_fragment($fragment4(), 7),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
