import { registerTemplate, renderApi } from "lwc";
const { t: api_text, h: api_element } = renderApi;
const $hoisted1 = api_element(
  "h1",
  {
    key: 0,
  },
  [api_text("hello")],
  true
);
const $hoisted2 = api_element(
  "br",
  {
    key: 1,
  },
  [],
  true
);
function tmpl($api, $cmp, $slotset, $ctx) {
  return [$hoisted1, $hoisted2];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
