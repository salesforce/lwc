import _fooBar from "foo/bar";
import { registerTemplate, renderApi } from "lwc";
const { h: api_element, c: api_custom_element } = renderApi;
const $hoisted1 = api_element(
  "p",
  {
    attrs: {
      title: "",
    },
    key: 0,
  },
  [],
  true
);
const stc0 = {
  props: {
    content: "",
    visible: true,
  },
  key: 1,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  return [$hoisted1, api_custom_element("foo-bar", _fooBar, stc0)];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
