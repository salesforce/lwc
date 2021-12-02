import { registerTemplate } from "lwc";
const stc0 = {
  key: 0,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const { t: api_text, h: api_element } = $api;
  return [api_element("p", stc0, [api_text("Root")])];
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
