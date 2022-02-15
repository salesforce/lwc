import { registerTemplate } from "lwc";
const stc0 = {
  styleDecls: [
    ["background", "blue", true],
    ["color", "red", false],
    ["opacity", "0.5", true],
  ],
  key: 0,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const { h: api_element } = $api;
  return [api_element("div", stc0)];
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
tmpl.version = 2;
