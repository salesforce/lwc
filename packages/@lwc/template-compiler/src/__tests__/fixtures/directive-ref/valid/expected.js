import { registerTemplate } from "lwc";
const stc0 = {
  ref: "foo",
  key: 0,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const { t: api_text, h: api_element } = $api;
  return [api_element("div", stc0, [api_text("Foo")])];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
