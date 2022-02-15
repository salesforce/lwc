import { registerTemplate } from "lwc";
const stc0 = {
  key: 0,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const { t: api_text, h: api_element } = $api;
  return [api_element("h1", stc0, [api_text("hello")])];
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
tmpl.version = 2;
