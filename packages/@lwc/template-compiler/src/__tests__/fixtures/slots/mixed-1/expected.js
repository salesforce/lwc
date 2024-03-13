import { parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<p${3}>Before header</p>`;
const $fragment2 = parseFragment`<p${3}>In</p>`;
const $fragment3 = parseFragment`<p${3}>between</p>`;
const $fragment4 = parseFragment`<p${3}>Default body</p>`;
const $fragment5 = parseFragment`<p${3}>Default footer</p>`;
const stc0 = {
  key: 0,
};
const stc1 = {
  attrs: {
    name: "header",
  },
  key: 2,
};
const stc2 = {
  key: 5,
};
const stc3 = {
  attrs: {
    name: "footer",
  },
  key: 7,
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
      api_static_fragment($fragment1, 1),
      api_slot("header", stc1, [api_text("Default header")], $slotset),
      api_static_fragment($fragment2, 3),
      api_static_fragment($fragment3, 4),
      api_slot("", stc2, [api_static_fragment($fragment4, "@:6")], $slotset),
      api_slot(
        "footer",
        stc3,
        [api_static_fragment($fragment5, "@footer:8")],
        $slotset
      ),
    ]),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.slots = ["", "footer", "header"];
tmpl.stylesheets = [];
