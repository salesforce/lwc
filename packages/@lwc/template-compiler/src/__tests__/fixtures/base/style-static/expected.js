import { parseFragment, registerTemplate } from "lwc";
let $fragment1;
const $hoisted1 = parseFragment`<section style="font-size: 12px; color: red; margin: 10px 5px 10px"${1}${2}></section>`;
let $fragment2;
const $hoisted2 = parseFragment`<section style="--my-color: blue; color: var(--my-color)"${1}${2}></section>`;
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
