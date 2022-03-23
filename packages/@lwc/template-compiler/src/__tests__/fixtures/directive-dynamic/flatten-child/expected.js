import { registerTemplate, renderApi } from "lwc";
const {
  t: api_text,
  h: api_element,
  dc: api_dynamic_component,
  f: api_flatten,
} = renderApi;
const stc0 = {
  key: 0,
};
const stc1 = {
  key: 1,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  return api_flatten([
    api_element("div", stc0, [api_text("sibling")]),
    api_dynamic_component("x-foo", $cmp.trackedProp.foo, stc1),
  ]);
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
