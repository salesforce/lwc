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
  slotAssignment: "slotname2",
  key: 2,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const {
    d: api_dynamic_text,
    t: api_text,
    h: api_element,
    fr: api_fragment,
    ssf: api_scoped_slot_factory,
    st: api_static_fragment,
    c: api_custom_element,
  } = $api;
  return [
    api_custom_element("x-child", _xChild, stc0, [
      api_scoped_slot_factory("slotname1", function (slot1data, key) {
        return api_fragment(
          key,
          [
            api_element("p", stc1, [
              api_text(api_dynamic_text(slot1data.name)),
            ]),
          ],
          0
        );
      }),
      api_element("span", stc2, [api_text("Willy Wonka")]),
      api_static_fragment($fragment1(), 4),
    ]),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
