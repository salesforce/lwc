import { registerTemplate } from "lwc";
const stc0 = {
  ref: "foo",
  key: 0,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const { t: api_text, dc: api_dynamic_component } = $api;
  return [api_dynamic_component($cmp.ctor, stc0, [api_text("Foo")])];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
tmpl.hasRefs = true;
