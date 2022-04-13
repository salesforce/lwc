import { parseFragment, registerTemplate } from "lwc";
let $fragment1;
const $hoisted1 = parseFragment`<h1${1}${2}>hello</h1>`;
let $fragment2;
const $hoisted2 = parseFragment`<br${1}${2}>`;
function tmpl($api, $cmp, $slotset, $ctx) {
  const { st: api_static_fragment } = $api;
  return [
    api_static_fragment($fragment1 || ($fragment1 = $hoisted1()), 1),
    api_static_fragment($fragment2 || ($fragment2 = $hoisted2()), 3),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
