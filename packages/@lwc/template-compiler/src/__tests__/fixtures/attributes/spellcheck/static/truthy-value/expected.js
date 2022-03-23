import _xFoo from "x/foo";
import { registerTemplate, renderApi } from "lwc";
const { c: api_custom_element } = renderApi;
const stc0 = {
  props: {
    spellcheck: true,
  },
  key: 0,
};
const stc1 = {
  props: {
    spellcheck: true,
  },
  key: 1,
};
const stc2 = {
  props: {
    spellcheck: true,
  },
  key: 2,
};
function tmpl($cmp, $slotset, $ctx) {
  return [
    api_custom_element("x-foo", _xFoo, stc0),
    api_custom_element("x-foo", _xFoo, stc1),
    api_custom_element("x-foo", _xFoo, stc2),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
