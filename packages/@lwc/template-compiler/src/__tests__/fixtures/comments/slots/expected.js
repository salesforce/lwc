import _xChild from "x/child";
import { parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<p${3}>slot content</p>`;
const stc0 = {
  key: 0,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const {
    co: api_comment,
    st: api_static_fragment,
    c: api_custom_element,
  } = $api;
  return [
    api_custom_element("x-child", _xChild, stc0, [
      api_comment(" HTML comment inside slot "),
      api_static_fragment($fragment1(), 2),
    ]),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
