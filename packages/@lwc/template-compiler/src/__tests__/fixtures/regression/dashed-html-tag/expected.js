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
const stc2 = [];
function tmpl($api, $cmp, $slotset, $ctx) {
  const { h: api_element } = $api;
  return [
    api_element("section", stc0, [api_element("color-profile", stc1, stc2)]),
  ];
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
