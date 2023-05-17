import { registerTemplate } from "lwc";
const stc0 = {
  key: 0,
};
const stc1 = {
  attrs: {
    slot: "header",
  },
  key: 1,
};
const stc2 = ["Header Slot Content"];
const stc3 = {
  attrs: {
    slot: "",
  },
  key: 2,
};
const stc4 = ["Default Content"];
function tmpl($api, $cmp, $slotset, $ctx) {
  const { h: api_element, dc: api_dynamic_component } = $api;
  return [
    api_dynamic_component($cmp.ctor, stc0, [
      api_element("p", stc1, stc2, 160),
      api_element("p", stc3, stc4, 160),
    ]),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
