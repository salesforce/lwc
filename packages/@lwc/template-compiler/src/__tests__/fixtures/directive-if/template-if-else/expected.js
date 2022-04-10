import { parseFragment, registerTemplate } from "lwc";
let $fragment1;
const $hoisted1 = parseFragment`<p${1}${2}>1</p>`;
let $fragment2;
const $hoisted2 = parseFragment`<p${1}${2}>2</p>`;
function tmpl($api, $cmp, $slotset, $ctx) {
  const { t: api_text, st: api_static_fragment } = $api;
  return [
    $cmp.isTrue
      ? api_static_fragment($fragment1 || ($fragment1 = $hoisted1()), 1)
      : null,
    !$cmp.isTrue2
      ? api_static_fragment($fragment2 || ($fragment2 = $hoisted2()), 3)
      : null,
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
