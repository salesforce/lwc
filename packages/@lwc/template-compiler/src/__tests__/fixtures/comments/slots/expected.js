import _xChild from "x/child";
import { registerTemplate, renderApi } from "lwc";
const {
  co: api_comment,
  t: api_text,
  h: api_element,
  c: api_custom_element,
} = renderApi;
const $hoisted1 = api_comment(" HTML comment inside slot ", true);
const $hoisted2 = api_element(
  "p",
  {
    key: 1,
  },
  [api_text("slot content")],
  true
);
const stc0 = {
  key: 0,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  return [api_custom_element("x-child", _xChild, stc0, [$hoisted1, $hoisted2])];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
