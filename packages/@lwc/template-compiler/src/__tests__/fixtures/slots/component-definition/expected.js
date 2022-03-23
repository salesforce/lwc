import _xFoo from "x/foo";
import { registerTemplate, renderApi } from "lwc";
const { s: api_slot, c: api_custom_element } = renderApi;
const stc0 = {
  key: 0,
};
const stc1 = {
  key: 1,
};
const stc2 = [];
function tmpl($cmp, $slotset, $ctx) {
  return [
    api_custom_element("x-foo", _xFoo, stc0, [
      api_slot("", stc1, stc2, $slotset),
    ]),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.slots = [""];
tmpl.stylesheets = [];
