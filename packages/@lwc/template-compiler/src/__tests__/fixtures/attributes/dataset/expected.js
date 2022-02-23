import { registerTemplate } from "lwc";
const stc0 = {
  key: 0,
};
const stc1 = {
  attrs: {
    "data-foo": "1",
    "data-bar-baz": "xyz",
  },
  key: 1,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const { h: api_element } = $api;
  return [api_element("section", stc0, [api_element("p", stc1)])];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
