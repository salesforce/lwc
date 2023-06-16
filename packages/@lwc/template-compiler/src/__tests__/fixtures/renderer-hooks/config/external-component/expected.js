import _fooBar from "foo/bar";
import { registerTemplate, renderer } from "lwc";
const stc0 = {
  key: 0,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const { c: api_custom_element, h: api_element } = $api;
  return [
    api_custom_element("foo-bar", _fooBar, stc0),
    api_element("foo-bar", {
      key: 1,
      renderer: renderer,
      external: true,
    }),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
