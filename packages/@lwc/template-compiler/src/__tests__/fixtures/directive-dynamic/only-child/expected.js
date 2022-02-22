import { registerTemplate } from "lwc";
const stc0 = {
  key: 0,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const { dc: api_dynamic_component, f: api_flatten } = $api;
  return api_flatten([
    api_dynamic_component("x-foo", $cmp.trackedProp.foo, stc0),
  ]);
  /*LWC compiler v2.9.0*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
