import { registerTemplate } from "lwc";
const stc0 = {
  key: 0,
};
const stc1 = {
  key: 1,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const {
    t: api_text,
    h: api_element,
    dc: api_dynamic_component,
    f: api_flatten,
  } = $api;
  return api_flatten([
    api_element("div", stc0, [api_text("sibling")]),
    api_dynamic_component("x-foo", $cmp.trackedProp.foo, stc1),
  ]);
  /*LWC compiler v2.9.0*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
