import { parseFragment, registerTemplate } from "lwc";
let $fragment1;
const $hoisted1 = parseFragment`<p${1}${2}>1</p>`;
let $fragment2;
const $hoisted2 = parseFragment`<p${1}${2}>3</p>`;
const stc0 = {
  key: 0,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const {
    t: api_text,
    st: api_static_fragment,
    d: api_dynamic_text,
    h: api_element,
  } = $api;
  return [
    api_element("section", stc0, [
      $cmp.isTrue
        ? api_static_fragment($fragment1 || ($fragment1 = $hoisted1()), 2)
        : null,
      api_text(api_dynamic_text($cmp.foo)),
      $cmp.isTrue
        ? api_static_fragment($fragment2 || ($fragment2 = $hoisted2()), 4)
        : null,
    ]),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
