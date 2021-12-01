import { registerTemplate } from "lwc";
const stc0 = {
  props: {
    value: "{value}",
  },
  key: 0,
};
const stc1 = [];
function tmpl($api, $cmp, $slotset, $ctx) {
  const { h: api_element } = $api;
  return [api_element("input", stc0, stc1)];
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
