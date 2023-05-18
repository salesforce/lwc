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
const stc2 = {
  attrs: {
    slot: "",
  },
  key: 2,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const { h: api_element, dc: api_dynamic_component } = $api;
  return [
    api_dynamic_component($cmp.ctor, stc0, [
      api_element("p", stc1, "Header Slot Content", 160),
      api_element("p", stc2, "Default Content", 160),
    ]),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
