import { registerTemplate, renderApi } from "lwc";
const { t: api_text, h: api_element, so: api_set_owner } = renderApi;
const $hoisted1 = api_element(
  "h1",
  {
    key: 0,
  },
  [api_text("hello")]
);
const $hoisted2 = api_element(
  "br",
  {
    key: 1,
  },
  []
);
function tmpl($api, $cmp, $slotset, $ctx) {
  return [api_set_owner($hoisted1), api_set_owner($hoisted2)];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
