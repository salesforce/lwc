import { registerTemplate } from "lwc";
const stc0 = {
  key: 1,
};
const stc1 = [];
function tmpl($api, $cmp, $slotset, $ctx) {
  const { dc: api_dynamic_component, fr: api_fragment } = $api;
  return [
    $cmp.visible.if
      ? api_fragment(
          0,
          [api_dynamic_component("x-foo", $cmp.trackedProp.foo, stc0)],
          0
        )
      : api_fragment(0, stc1, 0),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
