import _xChild from "x/child";
import { parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<span${3}>Chocolatier</span>`;
const stc0 = {
  key: 0,
};
const stc1 = {
  key: 1,
};
const stc2 = {
  attrs: {
    slot: "slotname2",
  },
  key: 2,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const {
    d: api_dynamic_text,
    t: api_text,
    h: api_element,
    ssf: api_scoped_slot_factory,
    st: api_static_fragment,
    c: api_custom_element,
  } = $api;
  return [
    api_custom_element("x-child", _xChild, stc0, [
      api_scoped_slot_factory(function (slot1data) {
        return [
          api_element("p", stc1, [api_text(api_dynamic_text(slot1data.name))]),
        ];
      }, "slotname1"),
      api_element("span", stc2, [api_text("Willy Wonka")]),
      api_static_fragment($fragment1(), 4),
    ]),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
