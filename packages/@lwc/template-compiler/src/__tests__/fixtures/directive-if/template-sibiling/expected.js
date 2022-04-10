import { parseFragment, registerTemplate } from "lwc";
let $fragment1;
const $hoisted1 = parseFragment`<p${1}${2}>1</p>`;
let $fragment2;
const $hoisted2 = parseFragment`<p${1}${2}>2</p>`;
let $fragment3;
const $hoisted3 = parseFragment`<p${1}${2}>3</p>`;
const stc0 = {
  key: 0,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const { t: api_text, st: api_static_fragment, h: api_element } = $api;
  return [
    api_element("section", stc0, [
      api_static_fragment($fragment1 || ($fragment1 = $hoisted1()), 2),
      $cmp.bar
        ? api_static_fragment($fragment2 || ($fragment2 = $hoisted2()), 4)
        : null,
      api_static_fragment($fragment3 || ($fragment3 = $hoisted3()), 6),
    ]),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
