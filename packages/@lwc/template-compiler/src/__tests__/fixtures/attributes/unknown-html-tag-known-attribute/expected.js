import { registerTemplate } from "lwc";
const stc0 = {
  attrs: {
    min: "4",
  },
  key: 0,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const { h: api_element } = $api;
  return [api_element("somefancytag", stc0)];
  /*LWC compiler v2.9.0*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
