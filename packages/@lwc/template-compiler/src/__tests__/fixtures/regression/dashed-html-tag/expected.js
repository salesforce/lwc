import { registerTemplate } from "lwc";
const stc0 = {
  key: 0,
};
const stc1 = {
  attrs: {
    local: "x",
  },
  key: 1,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const { h: api_element } = $api;
  return [api_element("section", stc0, [api_element("color-profile", stc1)])];
  /*LWC compiler v2.9.0*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
