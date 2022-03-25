import { registerTemplate, renderApi } from "lwc";
const {
  co: api_comment,
  so: api_set_owner,
  t: api_text,
  h: api_element,
} = renderApi;
const $hoisted1 = api_comment(" This is an HTML comment ");
const $hoisted2 = api_element(
  "button",
  {
    key: 0,
  },
  [api_text("click me")]
);
function tmpl($api, $cmp, $slotset, $ctx) {
  return [api_set_owner($hoisted1), api_set_owner($hoisted2)];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
