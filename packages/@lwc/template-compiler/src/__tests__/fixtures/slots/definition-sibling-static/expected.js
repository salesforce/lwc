import { parseFragment, registerTemplate } from "lwc";
let $fragment1;
const $hoisted1 = parseFragment`<p${1}${2}>Sibling</p>`;
let $fragment2;
const $hoisted2 = parseFragment`<p${1}${2}>Default slot content</p>`;
const stc0 = {
  key: 0,
};
const stc1 = {
  key: 3,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const {
    t: api_text,
    st: api_static_fragment,
    s: api_slot,
    h: api_element,
  } = $api;
  return [
    api_element("section", stc0, [
      api_static_fragment($fragment1 || ($fragment1 = $hoisted1()), 2),
      api_slot(
        "",
        stc1,
        [api_static_fragment($fragment2 || ($fragment2 = $hoisted2()), "@:5")],
        $slotset
      ),
    ]),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.slots = [""];
tmpl.stylesheets = [];
