import _fooBar from "foo/bar";
import { registerTemplate, renderApi } from "lwc";
const { h: api_element, c: api_custom_element } = renderApi;
const stc0 = {
  attrs: {
    title: "",
  },
  key: 0,
};
const stc1 = {
  props: {
    content: "",
    visible: true,
  },
  key: 1,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  return [api_element("p", stc0), api_custom_element("foo-bar", _fooBar, stc1)];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
