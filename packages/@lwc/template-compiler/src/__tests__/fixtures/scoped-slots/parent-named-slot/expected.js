import _xChild from "x/child";
import { registerTemplate } from "lwc";
const stc0 = {
  key: 0,
};
const stc1 = {
  key: 1,
};
const stc2 = {
  key: 2,
};
const stc3 = {
  key: 3,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const {
    d: api_dynamic_text,
    t: api_text,
    h: api_element,
    fr: api_fragment,
    ssf: api_scoped_slot_factory,
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
      api_scoped_slot_factory("slotname2", function (slot2data, key) {
        return api_fragment(
          key,
          [
            api_element("p", stc2, [
              api_text(api_dynamic_text(slot2data.title)),
            ]),
          ],
          0
        );
      }),
      api_scoped_slot_factory("", function (defaultdata, key) {
        return api_fragment(
          key,
          [
            api_element("p", stc3, [
              api_text(api_dynamic_text(defaultdata.title)),
            ]),
          ],
          0
        );
      }),
    ]),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
