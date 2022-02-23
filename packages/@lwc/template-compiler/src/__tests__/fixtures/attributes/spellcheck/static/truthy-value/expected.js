import _xFoo from "x/foo";
import { registerTemplate } from "lwc";
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
function tmpl($api, $cmp, $slotset, $ctx) {
  const { c: api_custom_element } = $api;
  return [
    api_custom_element("x-foo", _xFoo, stc0),
    api_custom_element("x-foo", _xFoo, stc1),
    api_custom_element("x-foo", _xFoo, stc2),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
