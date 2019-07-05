import { registerTemplate } from "lwc";

function tmpl($api, $cmp, $slotset, $ctx) {
  const { dc: api_dynamic_component } = $api;
  return api_dynamic_component(
    "x-foo",
    $cmp.trackedProp.foo,
    {
      context: {
        lwc: {}
      },
      key: 0
    },
    []
  );
}

export default registerTemplate(tmpl);
tmpl.stylesheets = [];
