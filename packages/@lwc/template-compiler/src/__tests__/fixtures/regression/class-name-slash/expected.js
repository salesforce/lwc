import _xCmp from "x/cmp";
import { registerTemplate, renderApi } from "lwc";
const { c: api_custom_element } = renderApi;
const stc0 = {
  classMap: {
    foo: true,
  },
  props: {
    xClass: "bar",
  },
  key: 0,
};
function tmpl($cmp, $slotset, $ctx) {
  return [api_custom_element("x-cmp", _xCmp, stc0)];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
