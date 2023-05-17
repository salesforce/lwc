import { registerTemplate } from "lwc";
const stc0 = {
  ref: "foo",
  key: 0,
};
const stc1 = ["Foo"];
function tmpl($api, $cmp, $slotset, $ctx) {
  const { h: api_element } = $api;
  return [api_element("div", stc0, stc1, 128)];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
tmpl.hasRefs = true;
