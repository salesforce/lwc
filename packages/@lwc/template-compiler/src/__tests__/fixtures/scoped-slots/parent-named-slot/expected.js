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
    ssf: api_scoped_slot_factory,
    c: api_custom_element,
  } = $api;
  return [
    api_custom_element("x-child", _xChild, stc0, [
      api_scoped_slot_factory("slotname1", function (slot1data) {
        return [
          api_element("p", stc1, [api_text(api_dynamic_text(slot1data.name))]),
        ];
      }),
      api_scoped_slot_factory("slotname2", function (slot2data) {
        return [
          api_element("p", stc2, [api_text(api_dynamic_text(slot2data.title))]),
        ];
      }),
      api_scoped_slot_factory("", function (defaultdata) {
        return [
          api_element("p", stc3, [
            api_text(api_dynamic_text(defaultdata.title)),
          ]),
        ];
      }),
    ]),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
