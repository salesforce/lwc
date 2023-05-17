import { registerTemplate } from "lwc";
const stc0 = {
  ref: "foo",
  key: 0,
};
const stc1 = ["Foo"];
function tmpl($api, $cmp, $slotset, $ctx) {
  const { dc: api_dynamic_component } = $api;
  return [api_dynamic_component($cmp.ctor, stc0, stc1)];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
tmpl.hasRefs = true;
