import _nsCmp from "ns/cmp";
import { registerTemplate, renderApi } from "lwc";
const {
  t: api_text,
  so: api_set_owner,
  h: api_element,
  c: api_custom_element,
} = renderApi;
const $hoisted1 = api_text("Header Slot Content");
const $hoisted2 = api_text("Default Content");
const stc0 = {
  key: 0,
};
const stc1 = {
  key: 1,
};
const stc2 = {
  attrs: {
    slot: "header",
  },
  key: 2,
};
const stc3 = {
  attrs: {
    slot: "",
  },
  key: 3,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  return [
    api_element("section", stc0, [
      api_custom_element("ns-cmp", _nsCmp, stc1, [
        api_element("p", stc2, [api_set_owner($hoisted1)]),
        api_element("p", stc3, [api_set_owner($hoisted2)]),
      ]),
    ]),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
