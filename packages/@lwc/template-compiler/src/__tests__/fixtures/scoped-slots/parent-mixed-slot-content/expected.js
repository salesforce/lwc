import _xChild from "x/child";
import { parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<p${3}>${"t1"}</p>`;
const $fragment2 = parseFragment`<span${3}>Chocolatier</span>`;
const stc0 = {
  key: 0,
};
const stc1 = {
  slotAssignment: "slotname2",
  key: 3,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const {
    d: api_dynamic_text,
    sp: api_static_part,
    st: api_static_fragment,
    fr: api_fragment,
    ssf: api_scoped_slot_factory,
    t: api_text,
    h: api_element,
    c: api_custom_element,
  } = $api;
  return [
    api_custom_element("x-child", _xChild, stc0, [
      api_scoped_slot_factory("slotname1", function (slot1data, key) {
        return api_fragment(
          key,
          [
            api_static_fragment($fragment1, 2, [
              api_static_part(1, null, api_dynamic_text(slot1data.name)),
            ]),
          ],
          0
        );
      }),
      api_element("span", stc1, [api_text("Willy Wonka")]),
      api_static_fragment($fragment2, 5),
    ]),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
