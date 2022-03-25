import { registerTemplate, renderApi } from "lwc";
const { t: api_text, so: api_set_owner } = renderApi;
const $hoisted1 = api_text("foo", true);
function tmpl($api, $cmp, $slotset, $ctx) {
  return [api_set_owner($hoisted1)];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
