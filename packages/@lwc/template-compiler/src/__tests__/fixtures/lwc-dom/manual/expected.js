import { registerTemplate } from "lwc";
const stc0 = {
  context: {
    lwc: {
      dom: "manual",
    },
  },
  key: 0,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const { h: api_element } = $api;
  return [api_element("div", stc0)];
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
tmpl.version = 2;
