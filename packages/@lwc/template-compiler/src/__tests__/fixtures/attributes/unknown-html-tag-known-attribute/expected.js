import { registerTemplate } from "lwc";
const stc0 = {
  attrs: {
    min: "4",
  },
  key: 0,
};
const stc1 = [];
function tmpl($api, $cmp, $slotset, $ctx) {
  const { h: api_element } = $api;
  return [api_element("somefancytag", stc0, stc1)];
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
