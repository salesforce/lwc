import _fooBar from "foo/bar";
import { parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<p title=""${3}></p>`;
const stc0 = {
  props: {
    content: "",
    visible: true,
  },
  key: 2,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const { st: api_static_fragment, c: api_custom_element } = $api;
  return [
    api_static_fragment($fragment1(), 1),
    api_custom_element("foo-bar", _fooBar, stc0),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
