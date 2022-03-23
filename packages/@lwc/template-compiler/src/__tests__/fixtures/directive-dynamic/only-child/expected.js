import { registerTemplate, renderApi } from "lwc";
const { dc: api_dynamic_component, f: api_flatten } = renderApi;
const stc0 = {
  key: 0,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  return api_flatten([
    api_dynamic_component("x-foo", $cmp.trackedProp.foo, stc0),
  ]);
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
