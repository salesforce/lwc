import _xChild from "x/child";
import { registerTemplate, renderApi } from "lwc";
const {
  co: api_comment,
  t: api_text,
  h: api_element,
  c: api_custom_element,
} = renderApi;
const stc0 = {
  key: 0,
};
const stc1 = {
  key: 1,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  return [
    api_custom_element("x-child", _xChild, stc0, [
      api_comment(" HTML comment inside slot "),
      api_element("p", stc1, [api_text("slot content")]),
    ]),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
