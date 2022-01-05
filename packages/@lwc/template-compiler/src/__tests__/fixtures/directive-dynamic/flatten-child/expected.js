import { registerTemplate } from "lwc";
function tmpl($api, $cmp, $slotset, $ctx) {
  const {
    t: api_text,
    h: api_element,
    dc: api_dynamic_component,
    f: api_flatten,
  } = $api;
  return api_flatten([
    api_element(
      "div",
      {
        key: 0,
      },
      [api_text("sibling")]
    ),
    api_dynamic_component(
      "x-foo",
      $cmp.trackedProp.foo,
      {
        key: 1,
      },
      []
    ),
  ]);
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
