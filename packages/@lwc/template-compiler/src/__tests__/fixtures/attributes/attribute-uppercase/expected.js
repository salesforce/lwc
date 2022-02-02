import _xButton from "x/button";
import { registerTemplate } from "lwc";
const stc0 = {
  props: {
    Class: "r",
    DataXx: "foo",
    AriaHidden: "hidden",
    Role: "xx",
    FooBar: "x",
    FooZaz: "z",
    Foo_bar_baz: "baz",
  },
  key: 0,
};
const stc1 = [];
function tmpl($api, $cmp, $slotset, $ctx) {
  const { c: api_custom_element } = $api;
  return [api_custom_element("x-button", _xButton, stc0, stc1)];
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
