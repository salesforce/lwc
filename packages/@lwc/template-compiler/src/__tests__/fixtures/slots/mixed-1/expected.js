import { parseFragment, registerTemplate } from "lwc";
let $fragment1;
const $hoisted1 = parseFragment`<p${1}${2}>Before header</p>`;
let $fragment2;
const $hoisted2 = parseFragment`<p${1}${2}>In</p>`;
let $fragment3;
const $hoisted3 = parseFragment`<p${1}${2}>between</p>`;
let $fragment4;
const $hoisted4 = parseFragment`<p${1}${2}>Default body</p>`;
let $fragment5;
const $hoisted5 = parseFragment`<p${1}${2}>Default footer</p>`;
const stc0 = {
  key: 0,
};
const stc1 = {
  attrs: {
    name: "header",
  },
  key: 3,
};
const stc2 = {
  key: 8,
};
const stc3 = {
  attrs: {
    name: "footer",
  },
  key: 11,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const {
    st: api_static_fragment,
    t: api_text,
    s: api_slot,
    h: api_element,
  } = $api;
  return [
    api_element("section", stc0, [
      api_static_fragment($fragment1 || ($fragment1 = $hoisted1()), 2),
      api_slot("header", stc1, [api_text("Default header")], $slotset),
      api_static_fragment($fragment2 || ($fragment2 = $hoisted2()), 5),
      api_static_fragment($fragment3 || ($fragment3 = $hoisted3()), 7),
      api_slot(
        "",
        stc2,
        [api_static_fragment($fragment4 || ($fragment4 = $hoisted4()), "@:10")],
        $slotset
      ),
      api_slot(
        "footer",
        stc3,
        [
          api_static_fragment(
            $fragment5 || ($fragment5 = $hoisted5()),
            "@footer:13"
          ),
        ],
        $slotset
      ),
    ]),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.slots = ["", "footer", "header"];
tmpl.stylesheets = [];
