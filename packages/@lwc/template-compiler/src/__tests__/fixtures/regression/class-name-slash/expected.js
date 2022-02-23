import _xCmp from "x/cmp";
import { registerTemplate } from "lwc";
const stc0 = {
  classMap: {
    foo: true,
  },
  props: {
    xClass: "bar",
  },
  key: 0,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const { c: api_custom_element } = $api;
  return [api_custom_element("x-cmp", _xCmp, stc0)];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
