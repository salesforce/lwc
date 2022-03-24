import { registerTemplate, renderApi } from "lwc";
const { co: api_comment, t: api_text, h: api_element } = renderApi;
const $hoisted1 = api_comment(" This is an HTML comment ", true);
const $hoisted2 = api_element(
  "button",
  {
    key: 0,
  },
  [api_text("click me")],
  true
);
function tmpl($api, $cmp, $slotset, $ctx) {
  return [$hoisted1, $hoisted2];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
