import { parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<p${3}>Sibling</p>`;
const $fragment2 = parseFragment`<p${3}>Default slot content</p>`;
const stc0 = {
  key: 0,
};
const stc1 = {
  key: 3,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const { st: api_static_fragment, s: api_slot, h: api_element } = $api;
  return [
    api_element("section", stc0, [
      api_static_fragment($fragment1(), 2),
      api_slot("", stc1, [api_static_fragment($fragment2(), "@:5")], $slotset),
    ]),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.slots = [""];
tmpl.stylesheets = [];
