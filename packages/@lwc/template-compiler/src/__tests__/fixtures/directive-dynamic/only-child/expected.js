import { registerTemplate } from "lwc";
const stc0 = {
  key: 0,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const { ddc: api_deprecated_dynamic_component } = $api;
  return [
    api_deprecated_dynamic_component("x-foo", $cmp.trackedProp.foo, stc0),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
