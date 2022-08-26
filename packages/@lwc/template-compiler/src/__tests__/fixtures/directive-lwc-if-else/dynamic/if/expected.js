import { registerTemplate } from "lwc";
const stc0 = {
  key: 0,
};
const stc1 = [];
function tmpl($api, $cmp, $slotset, $ctx) {
  const { dc: api_dynamic_component, f: api_flatten } = $api;
  return api_flatten([
    $cmp.visible.if
      ? api_flatten([
          api_dynamic_component("x-foo", $cmp.trackedProp.foo, stc0),
        ])
      : stc1,
  ]);
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
