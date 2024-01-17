import { registerTemplate } from "lwc";
const stc0 = {
  key: 0,
};
const stc1 = {
  slotAssignment: "header",
  key: 1,
};
const stc2 = {
  slotAssignment: "",
  key: 2,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const { t: api_text, h: api_element, dc: api_dynamic_component } = $api;
  return [
    api_dynamic_component($cmp.ctor, stc0, [
      api_element("p", stc1, [api_text("Header Slot Content")]),
      api_element("p", stc2, [api_text("Default Content")]),
    ]),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
