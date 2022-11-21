import _xTest from "x/test";
import { registerTemplate } from "lwc";
const stc0 = {
  key: 0,
};
const stc1 = {
  key: 1,
  external: true,
};
const stc2 = {
  key: 2,
  external: true,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const { c: api_custom_element, h: api_element } = $api;
  return [
    api_custom_element("x-test", _xTest, stc0),
    api_element("x-test", stc1),
    api_element("foo-bar", stc2),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
