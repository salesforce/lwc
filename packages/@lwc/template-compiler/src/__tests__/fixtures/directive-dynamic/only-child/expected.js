import { registerTemplate } from "lwc";
function tmpl($api, $cmp, $slotset, $ctx) {
  const { dc: api_dynamic_component, f: api_flatten } = $api;
  return api_flatten([
    api_dynamic_component(
      "x-foo",
      $cmp.trackedProp.foo,
      {
        key: 0,
      },
      []
    ),
  ]);
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
