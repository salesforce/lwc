import { registerTemplate, renderApi } from "lwc";
const {
  t: api_text,
  h: api_element,
  so: api_set_owner,
  dc: api_dynamic_component,
  f: api_flatten,
} = renderApi;
const $hoisted1 = api_element(
  "div",
  {
    key: 0,
  },
  [api_text("sibling")],
  true
);
const stc0 = {
  key: 1,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  return api_flatten([
    api_set_owner($hoisted1),
    api_dynamic_component("x-foo", $cmp.trackedProp.foo, stc0),
  ]);
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
