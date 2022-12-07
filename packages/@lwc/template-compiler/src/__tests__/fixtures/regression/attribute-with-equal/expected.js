import _xFoo from "x/foo";
import { parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<div props="{url: https://example.com/over/there?name=ferret}"${3}></div>`;
const stc0 = {
  props: {
    props: "{url: https://example.com/over/there?name=ferret}",
  },
  key: 0,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const { c: api_custom_element, st: api_static_fragment } = $api;
  return [
    api_custom_element("x-foo", _xFoo, stc0),
    api_static_fragment($fragment1(), 2),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
